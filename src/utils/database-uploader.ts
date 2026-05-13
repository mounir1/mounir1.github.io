/**
 * database-uploader.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Uploads seed data from the canonical initial-*.ts files into Firestore.
 * Single source of truth: initial-projects.ts, initial-experience.ts,
 * initial-skills.ts, and hook-level defaults (useUpcoming, useLinks).
 *
 * Duplicate detection: before inserting, checks existing docs by title/name
 * and skips items already present (by exact title/name match).
 */

import {
  collection, addDoc, getDocs, deleteDoc,
  writeBatch, doc, query, orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ─── Canonical seed sources ───────────────────────────────────────────────────
import { initialProjects }  from '@/data/initial-projects';
import { initialExperience } from '@/data/initial-experience';
import { initialSkills }    from '@/data/initial-skills';
import { DEFAULT_UPCOMING } from '@/hooks/useUpcoming';
import { DEFAULT_LINKS }    from '@/hooks/useLinks';
import { DEFAULT_SETTINGS } from '@/hooks/useSettings';

// ─── Collection names ─────────────────────────────────────────────────────────
export const COLLECTIONS = {
  projects:    'projects',
  experiences: 'experiences',
  skills:      'skills',
  upcoming:    'upcoming_projects',
  links:       'links',
  settings:    'settings',
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;

// ─── Progress / Result types ──────────────────────────────────────────────────
export interface UploadProgress {
  collection: string;
  current: number;
  total: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  skipped?: number;
  error?: string;
}

export interface UploadResult {
  collection: string;
  success: number;
  skipped: number;
  errors: number;
  total: number;
  details: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive a dedup key from an item (title for projects/experience, name for skills, label for links). */
function dedupKey(item: Record<string, any>): string {
  return (item.title ?? item.name ?? item.label ?? item.id ?? '').trim().toLowerCase();
}

/** Fetch existing dedup keys from a Firestore collection. */
async function fetchExistingKeys(collectionName: string): Promise<Set<string>> {
  if (!db) return new Set();
  const snap = await getDocs(collection(db, collectionName));
  const keys = new Set<string>();
  snap.docs.forEach(d => {
    const k = dedupKey(d.data());
    if (k) keys.add(k);
  });
  return keys;
}

/** Fetch current doc count from a collection. */
export async function getCollectionCount(collectionName: string): Promise<number> {
  if (!db) return 0;
  try {
    const snap = await getDocs(collection(db, collectionName));
    return snap.size;
  } catch {
    return 0;
  }
}

// ─── DatabaseUploader class ───────────────────────────────────────────────────

export class DatabaseUploader {
  private onProgress?: (progress: UploadProgress[]) => void;

  constructor(onProgress?: (progress: UploadProgress[]) => void) {
    this.onProgress = onProgress;
  }

  /** Delete every document in a collection. */
  async clearCollection(collectionName: string): Promise<number> {
    if (!db) throw new Error('Firebase not initialised');
    const snap = await getDocs(collection(db, collectionName));
    // Use batched deletes (max 500 per batch)
    let count = 0;
    const batchSize = 400;
    for (let i = 0; i < snap.docs.length; i += batchSize) {
      const batch = writeBatch(db);
      snap.docs.slice(i, i + batchSize).forEach(d => batch.delete(d.ref));
      await batch.commit();
      count += Math.min(batchSize, snap.docs.length - i);
    }
    return count;
  }

  /** Upload a single collection with optional dedup and clear-first. */
  async uploadCollection(
    collectionName: string,
    data: Record<string, any>[],
    opts: { clearFirst?: boolean; skipDuplicates?: boolean } = {},
  ): Promise<UploadResult> {
    if (!db) throw new Error('Firebase not initialised');

    const { clearFirst = false, skipDuplicates = true } = opts;

    const result: UploadResult = {
      collection: collectionName,
      success: 0,
      skipped: 0,
      errors: 0,
      total: data.length,
      details: [],
    };

    // Clear first if requested
    if (clearFirst) {
      const cleared = await this.clearCollection(collectionName);
      result.details.push(`🗑️  Cleared ${cleared} existing documents`);
    }

    // Load existing keys for dedup (only if not clearing first)
    const existingKeys = (skipDuplicates && !clearFirst)
      ? await fetchExistingKeys(collectionName)
      : new Set<string>();

    // Upload items one by one (addDoc — auto ID)
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const key  = dedupKey(item);
      const label = item.title ?? item.name ?? item.label ?? `Item ${i + 1}`;

      this.onProgress?.([{
        collection: collectionName,
        current: i + 1,
        total: data.length,
        status: 'uploading',
        skipped: result.skipped,
      }]);

      // Skip duplicate
      if (skipDuplicates && !clearFirst && key && existingKeys.has(key)) {
        result.skipped++;
        result.details.push(`⏭️  Skipped (duplicate): ${label}`);
        continue;
      }

      try {
        const now = Date.now();
        // Strip any local-only 'id' field — Firestore generates its own
        const { id: _id, ...rest } = item as any;
        const docData = {
          ...rest,
          createdAt: rest.createdAt || now,
          updatedAt: now,
          version: rest.version ?? 1,
        };
        await addDoc(collection(db, collectionName), docData);
        result.success++;
        result.details.push(`✅ Uploaded: ${label}`);
        if (key) existingKeys.add(key); // prevent in-batch duplicates
      } catch (err: any) {
        result.errors++;
        result.details.push(`❌ Error (${label}): ${err.message}`);
      }
    }

    this.onProgress?.([{
      collection: collectionName,
      current: data.length,
      total: data.length,
      status: result.errors > 0 ? 'error' : 'completed',
      skipped: result.skipped,
    }]);

    return result;
  }

  /** Upload ALL portfolio collections from the canonical seed sources. */
  async uploadAllData(
    opts: { clearFirst?: boolean; skipDuplicates?: boolean } = {},
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    // ── Ordered upload sequence ──
    const jobs: Array<{ key: CollectionKey; data: Record<string, any>[] }> = [
      { key: 'projects',    data: initialProjects as any },
      { key: 'experiences', data: initialExperience as any },
      { key: 'skills',      data: initialSkills as any },
      { key: 'upcoming',    data: DEFAULT_UPCOMING as any },
      { key: 'links',       data: DEFAULT_LINKS as any },
    ];

    for (const { key, data } of jobs) {
      const collectionName = COLLECTIONS[key];
      const result = await this.uploadCollection(collectionName, data, opts);
      results.push(result);
    }

    // ── Site settings (single document, merge) ────────────────────────────────
    try {
      if (db) {
        const { setDoc, doc: fsDoc } = await import('firebase/firestore');
        await setDoc(
          fsDoc(db, COLLECTIONS.settings, 'site'),
          { ...DEFAULT_SETTINGS, updatedAt: Date.now() },
          { merge: true },
        );
        results.push({
          collection: 'settings/site',
          success: 1,
          skipped: 0,
          errors: 0,
          total: 1,
          details: ['✅ Site settings saved'],
        });
      }
    } catch (err: any) {
      results.push({
        collection: 'settings/site',
        success: 0,
        skipped: 0,
        errors: 1,
        total: 1,
        details: [`❌ Settings error: ${err.message}`],
      });
    }

    return results;
  }
}

// ─── Convenience functions (available in browser console) ─────────────────────

export async function seedPortfolio(clearFirst = false) {
  const uploader = new DatabaseUploader(p => console.log('📊', p));
  console.log(`🚀 Seeding portfolio data (clearFirst=${clearFirst})…`);
  const results = await uploader.uploadAllData({ clearFirst, skipDuplicates: !clearFirst });

  let ok = 0, skip = 0, fail = 0;
  results.forEach(r => {
    ok   += r.success;
    skip += r.skipped;
    fail += r.errors;
    const icon = r.errors > 0 ? '⚠️' : '✅';
    console.log(`${icon} ${r.collection}: +${r.success} / ⏭${r.skipped} / ❌${r.errors}`);
  });
  console.log(`\n🎯 Total: +${ok} uploaded, ⏭${skip} skipped, ❌${fail} errors`);
  return results;
}

export async function clearAndSeed() {
  return seedPortfolio(true);
}

// Per-collection helpers
export async function seedProjects(clearFirst = false) {
  const u = new DatabaseUploader();
  return u.uploadCollection(COLLECTIONS.projects, initialProjects as any, { clearFirst, skipDuplicates: !clearFirst });
}
export async function seedExperience(clearFirst = false) {
  const u = new DatabaseUploader();
  return u.uploadCollection(COLLECTIONS.experiences, initialExperience as any, { clearFirst, skipDuplicates: !clearFirst });
}
export async function seedSkills(clearFirst = false) {
  const u = new DatabaseUploader();
  return u.uploadCollection(COLLECTIONS.skills, initialSkills as any, { clearFirst, skipDuplicates: !clearFirst });
}
export async function seedTestimonials(clearFirst = false) {
  const u = new DatabaseUploader();
  return u.uploadCollection(COLLECTIONS.testimonials, initialTestimonials as any, { clearFirst, skipDuplicates: !clearFirst });
}
export async function seedUpcoming(clearFirst = false) {
  const u = new DatabaseUploader();
  return u.uploadCollection(COLLECTIONS.upcoming, DEFAULT_UPCOMING as any, { clearFirst, skipDuplicates: !clearFirst });
}
export async function seedLinks(clearFirst = false) {
  const u = new DatabaseUploader();
  return u.uploadCollection(COLLECTIONS.links, DEFAULT_LINKS as any, { clearFirst, skipDuplicates: !clearFirst });
}

// Expose to browser console
if (typeof window !== 'undefined') {
  (window as any).seedPortfolio      = seedPortfolio;
  (window as any).clearAndSeed       = clearAndSeed;
  (window as any).seedProjects       = seedProjects;
  (window as any).seedExperience     = seedExperience;
  (window as any).seedSkills         = seedSkills;
  (window as any).seedTestimonials   = seedTestimonials;
  (window as any).seedUpcoming       = seedUpcoming;
  (window as any).seedLinks          = seedLinks;
  // Legacy aliases
  (window as any).uploadAllPortfolioData = seedPortfolio;
  (window as any).clearAndUploadAll      = clearAndSeed;
  (window as any).uploadProjectsOnly     = seedProjects;
  (window as any).uploadSkillsOnly       = seedSkills;
  (window as any).uploadExperienceOnly   = seedExperience;
}

/**
 * database-uploader.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Uploads seed data from the canonical initial-*.ts files into Firestore.
 * Single source of truth: initial-projects.ts, initial-experience.ts,
 * initial-skills.ts, initial-testimonials.ts, and hook-level defaults
 * (useUpcoming, useLinks).
 *
 * Duplicate detection: before inserting, checks existing docs by title/name
 * and skips items already present (by exact title/name match).
 */

import {
  collection, addDoc, getDocs, deleteDoc, updateDoc,
  writeBatch, doc, query, orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sanitizeDoc } from '@/utils/firestore-write';

// ─── Canonical seed sources ───────────────────────────────────────────────────
import { initialProjects }  from '@/data/initial-projects';
import { initialExperience } from '@/data/initial-experience';
import { initialSkills }    from '@/data/initial-skills';
import { initialTestimonials } from '@/data/initial-testimonials';
import { DEFAULT_UPCOMING } from '@/hooks/useUpcoming';
import { DEFAULT_LINKS }    from '@/hooks/useLinks';
import { DEFAULT_SETTINGS } from '@/hooks/useSettings';
import { TESTIMONIALS_COLLECTION } from '@/hooks/useTestimonials';

// ─── Collection names ─────────────────────────────────────────────────────────
export const COLLECTIONS = {
  projects:     'projects',
  experiences:  'experiences',
  skills:       'skills',
  testimonials: TESTIMONIALS_COLLECTION,
  upcoming:     'upcoming_projects',
  links:        'links',
  settings:     'settings',
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;

/** Generic shape accepted by the uploader — any seed item is a plain object. */
export type SeedItem = Record<string, unknown>;

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
  /** Documents updated in place (sync mode). */
  updated: number;
  errors: number;
  total: number;
  details: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract a string field from a seed item, if present. */
function strField(item: SeedItem, key: string): string | undefined {
  const v = item[key];
  return typeof v === 'string' ? v : undefined;
}

/** Derive a dedup key from an item (title for projects/experience, name for skills, label for links). */
function dedupKey(item: SeedItem): string {
  const v = strField(item, 'title') ?? strField(item, 'name') ?? strField(item, 'label') ?? strField(item, 'id') ?? '';
  return v.trim().toLowerCase();
}

/** Human-readable label for an item, for progress logs. */
function itemLabel(item: SeedItem, fallback: string): string {
  return strField(item, 'title') ?? strField(item, 'name') ?? strField(item, 'label') ?? fallback;
}

/** Fetch existing docs keyed by their dedup key (title / name / label). */
async function fetchExistingDocs(
  collectionName: string,
): Promise<Map<string, { id: string; data: SeedItem }>> {
  const map = new Map<string, { id: string; data: SeedItem }>();
  if (!db) return map;
  const snap = await getDocs(collection(db, collectionName));
  snap.docs.forEach((d) => {
    const data = d.data() as SeedItem;
    const k = dedupKey(data);
    if (k) map.set(k, { id: d.id, data });
  });
  return map;
}

// ─── Canonical seed sources (collection → seed rows) ──────────────────────────

export const SEED_SOURCES: Record<CollectionKey, SeedItem[]> = {
  projects: initialProjects as unknown as SeedItem[],
  experiences: initialExperience as unknown as SeedItem[],
  skills: initialSkills as unknown as SeedItem[],
  testimonials: initialTestimonials as unknown as SeedItem[],
  upcoming: DEFAULT_UPCOMING as unknown as SeedItem[],
  links: DEFAULT_LINKS as unknown as SeedItem[],
  settings: [],
};

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

/** Normalise a caught error into a readable message. */
function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
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

  /**
   * Upload a single collection.
   * @param opts.updateExisting — rows whose title/name already exists are
   *   updated in place (keeping their Firestore id and createdAt) instead of
   *   being skipped. This is what pushes edited seed data live.
   */
  async uploadCollection(
    collectionName: string,
    data: SeedItem[],
    opts: { clearFirst?: boolean; skipDuplicates?: boolean; updateExisting?: boolean } = {},
  ): Promise<UploadResult> {
    if (!db) throw new Error('Firebase not initialised');

    const { clearFirst = false, skipDuplicates = true, updateExisting = false } = opts;

    const result: UploadResult = {
      collection: collectionName,
      success: 0,
      skipped: 0,
      updated: 0,
      errors: 0,
      total: data.length,
      details: [],
    };

    // Clear first if requested
    if (clearFirst) {
      const cleared = await this.clearCollection(collectionName);
      result.details.push(`🗑️  Cleared ${cleared} existing documents`);
    }

    // Load existing docs for dedup/update (only if not clearing first)
    const existingDocs = (!clearFirst && (skipDuplicates || updateExisting))
      ? await fetchExistingDocs(collectionName)
      : new Map<string, { id: string; data: SeedItem }>();

    // Upload items one by one (addDoc — auto ID)
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const key  = dedupKey(item);
      const label = itemLabel(item, `Item ${i + 1}`);

      this.onProgress?.([{
        collection: collectionName,
        current: i + 1,
        total: data.length,
        status: 'uploading',
        skipped: result.skipped,
      }]);

      const existing = key ? existingDocs.get(key) : undefined;

      // Sync mode — update the existing record in place
      if (existing && existing.id && updateExisting) {
        try {
          const now = Date.now();
          const payload = sanitizeDoc({
            ...item,
            createdAt: existing.data.createdAt ?? item.createdAt ?? now,
            updatedAt: now,
            version: Number(existing.data.version ?? 1) + 1,
          });
          await updateDoc(doc(db, collectionName, existing.id), payload);
          result.updated++;
          result.details.push(`♻️  Updated: ${label}`);
        } catch (err: unknown) {
          result.errors++;
          result.details.push(`❌ Update error (${label}): ${errorMessage(err)}`);
        }
        continue;
      }

      // Skip duplicate
      if (skipDuplicates && existing) {
        result.skipped++;
        result.details.push(`⏭️  Skipped (duplicate): ${label}`);
        continue;
      }

      try {
        const now = Date.now();
        const docData = sanitizeDoc({
          ...item,
          createdAt: item.createdAt || now,
          updatedAt: now,
          version: item.version ?? 1,
        });
        await addDoc(collection(db, collectionName), docData);
        result.success++;
        result.details.push(`✅ Uploaded: ${label}`);
        // Prevent in-batch duplicates (empty id = no doc id to update later)
        if (key) existingDocs.set(key, { id: '', data: item });
      } catch (err: unknown) {
        result.errors++;
        result.details.push(`❌ Error (${label}): ${errorMessage(err)}`);
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
    opts: { clearFirst?: boolean; skipDuplicates?: boolean; updateExisting?: boolean } = {},
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    // ── Ordered upload sequence (settings is a single doc, handled below) ──
    const jobs = (Object.keys(SEED_SOURCES) as CollectionKey[])
      .filter((key) => key !== 'settings')
      .map((key) => ({ key, data: SEED_SOURCES[key] }));

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
          sanitizeDoc({ ...DEFAULT_SETTINGS, updatedAt: Date.now() }),
          { merge: true },
        );
        results.push({
          collection: 'settings/site',
          success: 1,
          skipped: 0,
          updated: 0,
          errors: 0,
          total: 1,
          details: ['✅ Site settings saved'],
        });
      }
    } catch (err: unknown) {
      results.push({
        collection: 'settings/site',
        success: 0,
        skipped: 0,
        updated: 0,
        errors: 1,
        total: 1,
        details: [`❌ Settings error: ${errorMessage(err)}`],
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

  let ok = 0, skip = 0, fail = 0, upd = 0;
  results.forEach(r => {
    ok   += r.success;
    skip += r.skipped;
    upd  += r.updated;
    fail += r.errors;
    const icon = r.errors > 0 ? '⚠️' : '✅';
    console.log(`${icon} ${r.collection}: +${r.success} / ♻️${r.updated} / ⏭${r.skipped} / ❌${r.errors}`);
  });
  console.log(`\n🎯 Total: +${ok} uploaded, ♻️${upd} updated, ⏭${skip} skipped, ❌${fail} errors`);
  return results;
}

export async function clearAndSeed() {
  return seedPortfolio(true);
}

/**
 * Sync Firestore with the canonical seed data: rows that already exist
 * (matched by title/name) are UPDATED in place — keeping their Firestore id
 * and createdAt — instead of being skipped. This is how edited seed data
 * (initial-*.ts) is published without wiping manual admin edits.
 */
export async function syncPortfolio() {
  const uploader = new DatabaseUploader(p => console.log('📊', p));
  console.log('🔄 Syncing Firestore with the canonical seed data…');
  const results = await uploader.uploadAllData({ updateExisting: true, skipDuplicates: false });

  let created = 0, skip = 0, fail = 0, upd = 0;
  results.forEach(r => {
    created += r.success;
    skip    += r.skipped;
    upd     += r.updated;
    fail    += r.errors;
    const icon = r.errors > 0 ? '⚠️' : '✅';
    console.log(`${icon} ${r.collection}: +${r.success} new / ♻️${r.updated} updated / ❌${r.errors}`);
  });
  console.log(`\n🎯 Total: +${created} new, ♻️${upd} updated, ⏭${skip} skipped, ❌${fail} errors`);
  return results;
}

/** Sync a single collection by its Firestore collection name. */
export async function syncCollection(collectionName: string) {
  const key = (Object.keys(COLLECTIONS) as CollectionKey[])
    .find((k) => COLLECTIONS[k] === collectionName);
  if (!key) throw new Error(`Unknown collection: ${collectionName}`);
  const uploader = new DatabaseUploader();
  return uploader.uploadCollection(collectionName, SEED_SOURCES[key], {
    updateExisting: true,
    skipDuplicates: false,
  });
}

// Per-collection helpers
export async function seedProjects(clearFirst = false) {
  const u = new DatabaseUploader();
  return u.uploadCollection(COLLECTIONS.projects, initialProjects as unknown as SeedItem[], { clearFirst, skipDuplicates: !clearFirst });
}
export async function seedExperience(clearFirst = false) {
  const u = new DatabaseUploader();
  return u.uploadCollection(COLLECTIONS.experiences, initialExperience as unknown as SeedItem[], { clearFirst, skipDuplicates: !clearFirst });
}
export async function seedSkills(clearFirst = false) {
  const u = new DatabaseUploader();
  return u.uploadCollection(COLLECTIONS.skills, initialSkills as unknown as SeedItem[], { clearFirst, skipDuplicates: !clearFirst });
}
export async function seedTestimonials(clearFirst = false) {
  const u = new DatabaseUploader();
  return u.uploadCollection(COLLECTIONS.testimonials, initialTestimonials as unknown as SeedItem[], { clearFirst, skipDuplicates: !clearFirst });
}
export async function seedUpcoming(clearFirst = false) {
  const u = new DatabaseUploader();
  return u.uploadCollection(COLLECTIONS.upcoming, DEFAULT_UPCOMING as unknown as SeedItem[], { clearFirst, skipDuplicates: !clearFirst });
}
export async function seedLinks(clearFirst = false) {
  const u = new DatabaseUploader();
  return u.uploadCollection(COLLECTIONS.links, DEFAULT_LINKS as unknown as SeedItem[], { clearFirst, skipDuplicates: !clearFirst });
}

// ─── Browser console exposure ──────────────────────────────────────────────────
// Use declaration merging (not a type alias) so this augments the existing
// ambient `interface Window` from src/vite-env.d.ts instead of being ignored.
declare global {
  interface Window {
    seedPortfolio?: typeof seedPortfolio;
    clearAndSeed?: typeof clearAndSeed;
    syncPortfolio?: typeof syncPortfolio;
    syncCollection?: typeof syncCollection;
    seedProjects?: typeof seedProjects;
    seedExperience?: typeof seedExperience;
    seedSkills?: typeof seedSkills;
    seedTestimonials?: typeof seedTestimonials;
    seedUpcoming?: typeof seedUpcoming;
    seedLinks?: typeof seedLinks;
    // Legacy aliases
    uploadAllPortfolioData?: typeof seedPortfolio;
    clearAndUploadAll?: typeof clearAndSeed;
    uploadProjectsOnly?: typeof seedProjects;
    uploadSkillsOnly?: typeof seedSkills;
    uploadExperienceOnly?: typeof seedExperience;
  }
}

if (typeof window !== 'undefined') {
  window.seedPortfolio      = seedPortfolio;
  window.clearAndSeed       = clearAndSeed;
  window.syncPortfolio      = syncPortfolio;
  window.syncCollection     = syncCollection;
  window.seedProjects       = seedProjects;
  window.seedExperience     = seedExperience;
  window.seedSkills         = seedSkills;
  window.seedTestimonials   = seedTestimonials;
  window.seedUpcoming       = seedUpcoming;
  window.seedLinks          = seedLinks;
  // Legacy aliases
  window.uploadAllPortfolioData = seedPortfolio;
  window.clearAndUploadAll      = clearAndSeed;
  window.uploadProjectsOnly     = seedProjects;
  window.uploadSkillsOnly       = seedSkills;
  window.uploadExperienceOnly   = seedExperience;
}

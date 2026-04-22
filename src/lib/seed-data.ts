/**
 * seed-data.ts – Seeds Firestore with initial portfolio data.
 * Covers projects, experiences, and skills collections.
 * Skips any collection that already has documents to avoid duplicates.
 */

import { addDoc, collection, getDocs } from "firebase/firestore";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import { initialProjects } from "@/data/initial-projects";
import { initialExperience } from "@/data/initial-experience";
import { initialSkills } from "@/data/initial-skills";
import { PROJECTS_COLLECTION } from "@/hooks/useProjects";
import { EXPERIENCE_COLLECTION } from "@/hooks/useExperience";
import { SKILLS_COLLECTION } from "@/hooks/useSkills";

async function seedCollection(
  collectionName: string,
  items: Record<string, unknown>[],
  label: string
): Promise<{ seeded: number; skipped: boolean }> {
  if (!db) return { seeded: 0, skipped: true };
  const snap = await getDocs(collection(db, collectionName));
  if (snap.docs.length > 0) {
    return { seeded: 0, skipped: true };
  }
  let seeded = 0;
  for (const item of items) {
    try {
      await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: item["createdAt"] ?? Date.now(),
        updatedAt: item["updatedAt"] ?? Date.now(),
        version: item["version"] ?? 1,
      });
      seeded++;
    } catch (err) {
      console.error(`[seed] ${label}: failed to add item`, err);
    }
  }
  return { seeded, skipped: false };
}

export async function seedInitialData(): Promise<boolean> {
  if (!isFirebaseEnabled || !db) return false;
  try {
    const [projects, experiences, skills] = await Promise.all([
      seedCollection(PROJECTS_COLLECTION, initialProjects as unknown as Record<string, unknown>[], "Projects"),
      seedCollection(EXPERIENCE_COLLECTION, initialExperience as unknown as Record<string, unknown>[], "Experience"),
      seedCollection(SKILLS_COLLECTION, initialSkills as unknown as Record<string, unknown>[], "Skills"),
    ]);
    const totalSeeded = projects.seeded + experiences.seeded + skills.seeded;
    return totalSeeded > 0 || projects.skipped;
  } catch (err) {
    console.error("[seed] Fatal error:", err);
    return false;
  }
}

export async function seedProjects(): Promise<number> {
  if (!isFirebaseEnabled || !db) return 0;
  const r = await seedCollection(PROJECTS_COLLECTION, initialProjects as unknown as Record<string, unknown>[], "Projects");
  return r.seeded;
}

export async function seedExperiences(): Promise<number> {
  if (!isFirebaseEnabled || !db) return 0;
  const r = await seedCollection(EXPERIENCE_COLLECTION, initialExperience as unknown as Record<string, unknown>[], "Experience");
  return r.seeded;
}

export async function seedSkills(): Promise<number> {
  if (!isFirebaseEnabled || !db) return 0;
  const r = await seedCollection(SKILLS_COLLECTION, initialSkills as unknown as Record<string, unknown>[], "Skills");
  return r.seeded;
}

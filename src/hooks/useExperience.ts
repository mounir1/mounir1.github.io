import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import { initialExperience } from "@/data/initial-experience";

export interface Experience {
  id: string;
  title: string;
  company: string;
  companyUrl?: string;
  companyLogo?: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "freelance" | "internship" | "consulting";
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  projects?: string[];
  skills: string[];
  responsibilities: string[];
  featured: boolean;
  disabled: boolean;
  priority: number;
  icon?: string;
  createdAt: number;
  updatedAt: number;
}

export type ExperienceInput = Omit<Experience, "id">;

export const EXPERIENCE_COLLECTION = "experiences";

export const DEFAULT_EXPERIENCE: ExperienceInput = {
  title: "",
  company: "",
  companyUrl: "",
  companyLogo: "",
  location: "",
  type: "full-time",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
  achievements: [],
  technologies: [],
  projects: [],
  skills: [],
  responsibilities: [],
  featured: false,
  disabled: false,
  priority: 50,
  icon: "",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * @param adminMode - When true, fetches ALL experiences including disabled ones.
 *                    Use in admin panels. Default: false (public view).
 */
export function useExperience(adminMode = false) {
  // Local fallback is resolved during lazy state init — no synchronous
  // setState inside the effect (react-hooks/set-state-in-effect) and no
  // empty-state flash when Firebase is disabled.
  const [experiences, setExperiences] = useState<Experience[]>(() =>
    !isFirebaseEnabled || !db
      ? initialExperience.map((exp, index) => ({ id: `local-exp-${index}`, ...exp }))
      : []
  );
  const [loading, setLoading] = useState(isFirebaseEnabled && !!db);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Local data already seeded via lazy init when Firebase is disabled
    if (!isFirebaseEnabled || !db) {
      console.log("Using local experience data — Firebase disabled in development");
      return;
    }

    // Index-free by design: this collection's composite index was never
    // deployed, so a server-side where+orderBy fails ("query requires an
    // index") and silently falls back to local data with phantom ids.
    // Fetch everything (single-field auto-index) and sort/filter client-side.
    const q = collection(db, EXPERIENCE_COLLECTION);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const all = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Experience[];

        const sorted = [...all].sort(
          (a, b) =>
            (b.priority ?? 0) - (a.priority ?? 0) ||
            String(b.startDate ?? "").localeCompare(String(a.startDate ?? "")) ||
            a.id.localeCompare(b.id)
        );
        setExperiences(
          adminMode ? sorted : sorted.filter((e) => e.disabled !== true)
        );
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching experience from Firebase:", err);
        console.log("Falling back to local experience data");
        const localExperience: Experience[] = initialExperience.map((exp, index) => ({
          id: `fallback-exp-${index}`,
          ...exp,
        }));
        setExperiences(localExperience);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [adminMode]);

  return { experiences, loading, error };
}

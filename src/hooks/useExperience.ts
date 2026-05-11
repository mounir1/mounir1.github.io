import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import { initialExperience } from "@/data/initial-experience";

export interface Experience {
  id: string;
  title: string;
  company: string;
  companyUrl?: string;
  companyLogo?: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "freelance" | "internship";
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
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use local data when Firebase is not enabled (development mode)
    if (!isFirebaseEnabled || !db) {
      console.log("Using local experience data — Firebase disabled in development");
      const localExperience: Experience[] = initialExperience.map((exp, index) => ({
        id: `local-exp-${index}`,
        ...exp,
      }));
      setExperiences(localExperience);
      setLoading(false);
      setError(null);
      return;
    }

    // Build query — admin sees all, public only sees non-disabled
    const q = adminMode
      ? query(
          collection(db, EXPERIENCE_COLLECTION),
          orderBy("priority", "desc"),
          orderBy("startDate", "desc")
        )
      : query(
          collection(db, EXPERIENCE_COLLECTION),
          where("disabled", "==", false),
          orderBy("priority", "desc"),
          orderBy("startDate", "desc")
        );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const experienceData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Experience[];

        setExperiences(experienceData);
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

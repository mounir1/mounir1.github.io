import { useEffect, useState, useMemo } from "react";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import {
  collection, onSnapshot, addDoc, deleteDoc,
  updateDoc, doc, orderBy, query, where,
} from "firebase/firestore";
import { initialTestimonials } from "@/data/initial-testimonials";

export interface Testimonial {
  id: string;
  // Author fields (new unified naming — clientName/clientTitle still accepted for backward compat)
  author: string;        // formerly clientName
  role: string;          // formerly clientTitle
  company?: string;      // formerly clientCompany
  companyUrl?: string;
  avatar?: string;       // formerly clientPhoto
  linkedin?: string;     // formerly clientLinkedin
  // Content
  content: string;
  rating: number;        // 1–5
  // Metadata
  projectName?: string;  // project this was for
  projectId?: string;
  experienceId?: string;
  date?: string;
  source: "linkedin" | "email" | "direct" | "upwork" | "referral" | "other";
  sourceUrl?: string;
  verified?: boolean;
  // Admin flags
  featured: boolean;
  disabled: boolean;
  priority: number;
  createdAt: number;
  updatedAt: number;
}

export type TestimonialInput = Omit<Testimonial, "id" | "createdAt" | "updatedAt">;

export const DEFAULT_TESTIMONIAL: TestimonialInput = {
  author: "",
  role: "",
  company: "",
  companyUrl: "",
  avatar: "",
  linkedin: "",
  content: "",
  rating: 5,
  projectName: "",
  projectId: "",
  experienceId: "",
  date: "",
  source: "linkedin",
  sourceUrl: "",
  verified: false,
  featured: false,
  disabled: false,
  priority: 50,
};

export const TESTIMONIALS_COLLECTION = "testimonials";

/**
 * @param adminMode — When true, fetches all testimonials including disabled ones.
 */
export function useTestimonials(adminMode = false) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fallback to local data when Firebase is unavailable (same pattern as useProjects)
    if (!isFirebaseEnabled || !db) {
      const localTestimonials: Testimonial[] = initialTestimonials.map((t, i) => ({
        id: `local-testimonial-${i}`,
        ...t,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
      // In public mode, only show non-disabled featured items
      setTestimonials(
        adminMode ? localTestimonials : localTestimonials.filter(t => !t.disabled)
      );
      setLoading(false);
      return;
    }

    const constraints: any[] = [orderBy("priority", "desc")];
    if (!adminMode) constraints.unshift(where("disabled", "==", false));

    const q = query(collection(db, TESTIMONIALS_COLLECTION), ...constraints);

    const unsub = onSnapshot(
      q,
      (snap) => {
        setTestimonials(
          snap.docs.map((d) => {
            const data = d.data();
            // Backward-compat: map old clientName/clientTitle/clientCompany fields
            return {
              id: d.id,
              author:  data.author  ?? data.clientName    ?? "",
              role:    data.role    ?? data.clientTitle   ?? "",
              company: data.company ?? data.clientCompany ?? "",
              avatar:  data.avatar  ?? data.clientPhoto   ?? "",
              linkedin: data.linkedin ?? data.clientLinkedin ?? "",
              ...data,
            } as Testimonial;
          })
        );
        setLoading(false);
      },
      () => { setLoading(false); }
    );

    return () => unsub();
  }, [adminMode]);

  const featured = useMemo(
    () => testimonials.filter((t) => t.featured && !t.disabled),
    [testimonials]
  );

  const addTestimonial = async (data: TestimonialInput) => {
    if (!isFirebaseEnabled || !db) { console.warn("Firebase not available"); return; }
    return addDoc(collection(db, TESTIMONIALS_COLLECTION), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  };

  const updateTestimonial = async (id: string, data: Partial<TestimonialInput>) => {
    if (!isFirebaseEnabled || !db) { console.warn("Firebase not available"); return; }
    return updateDoc(doc(db, TESTIMONIALS_COLLECTION, id), { ...data, updatedAt: Date.now() });
  };

  const deleteTestimonial = async (id: string) => {
    if (!isFirebaseEnabled || !db) { console.warn("Firebase not available"); return; }
    return deleteDoc(doc(db, TESTIMONIALS_COLLECTION, id));
  };

  return {
    testimonials,
    featured,
    loading,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
  };
}

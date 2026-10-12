import { useEffect, useState, useMemo } from "react";
import { isFirebaseEnabled } from "@/lib/firebase-config";
import { getDb } from "@/lib/firestore-client";
import { sanitizeDoc } from "@/utils/firestore-write";
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
  // Local fallback resolved during lazy state init — no synchronous setState
  // in the effect (react-hooks/set-state-in-effect) and no empty-state flash.
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    if (isFirebaseEnabled) return [];
    const seededAt = Date.now();
    const localTestimonials: Testimonial[] = initialTestimonials.map((t, i) => ({
      id: `local-testimonial-${i}`,
      ...t,
      createdAt: seededAt,
      updatedAt: seededAt,
    }));
    // In public mode, only show non-disabled items
    return adminMode ? localTestimonials : localTestimonials.filter((t) => !t.disabled);
  });
  const [loading, setLoading] = useState(isFirebaseEnabled);

  useEffect(() => {
    // Local data already seeded via lazy init when Firebase is disabled
    if (!isFirebaseEnabled) {
      return;
    }

    let unsub: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      try {
        const [{ collection, onSnapshot }, db] = await Promise.all([
          import("firebase/firestore"),
          getDb(),
        ]);
        if (cancelled) return;

        // Index-free by design — see useProjects for rationale.
        unsub = onSnapshot(
          collection(db, TESTIMONIALS_COLLECTION),
          (snap) => {
            const all = snap.docs.map((d) => {
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
            });
            const sorted = [...all].sort(
              (a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id)
            );
            setTestimonials(
              adminMode ? sorted : sorted.filter((t) => t.disabled !== true)
            );
            setLoading(false);
          },
          () => { setLoading(false); }
        );
      } catch {
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [adminMode]);

  const featured = useMemo(
    () => testimonials.filter((t) => t.featured && !t.disabled),
    [testimonials]
  );

  const addTestimonial = async (data: TestimonialInput) => {
    if (!isFirebaseEnabled) { console.warn("Firebase not available"); return; }
    const [{ addDoc, collection }, db] = await Promise.all([
      import("firebase/firestore"),
      getDb(),
    ]);
    return addDoc(collection(db, TESTIMONIALS_COLLECTION), sanitizeDoc({ ...data, createdAt: Date.now(), updatedAt: Date.now() }));
  };

  const updateTestimonial = async (id: string, data: Partial<TestimonialInput>) => {
    if (!isFirebaseEnabled) { console.warn("Firebase not available"); return; }
    const [{ updateDoc, doc: docRef }, db] = await Promise.all([
      import("firebase/firestore"),
      getDb(),
    ]);
    return updateDoc(docRef(db, TESTIMONIALS_COLLECTION, id), sanitizeDoc({ ...data, updatedAt: Date.now() }));
  };

  const deleteTestimonial = async (id: string) => {
    if (!isFirebaseEnabled) { console.warn("Firebase not available"); return; }
    const [{ deleteDoc, doc: docRef }, db] = await Promise.all([
      import("firebase/firestore"),
      getDb(),
    ]);
    return deleteDoc(docRef(db, TESTIMONIALS_COLLECTION, id));
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

/**
 * useTestimonials – Real-time Firebase hook with local fallback.
 * Provides testimonials list + featured subset.
 */

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import type { TestimonialSchema } from "@/lib/database-schema";
import { COLLECTIONS } from "@/lib/database-schema";

export type { TestimonialSchema };
export type TestimonialInput = Omit<TestimonialSchema, "id">;

// ── Seed fallback data ─────────────────────────────────────────────────────────

const FALLBACK_TESTIMONIALS: TestimonialInput[] = [
  {
    clientName: "Ahmed Benali",
    clientTitle: "CTO",
    clientCompany: "HoTech Systems",
    clientPhoto: "",
    content:
      "Mounir delivered outstanding results on our platform — a 75% performance improvement and flawless WebSocket integration. Highly recommended!",
    rating: 5,
    projectId: "",
    experienceId: "",
    featured: true,
    disabled: false,
    priority: 90,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    clientName: "Sara Meziane",
    clientTitle: "Product Manager",
    clientCompany: "TechnoStationery",
    clientPhoto: "",
    content:
      "Our e-commerce sales grew 300% after Mounir rebuilt the platform. The payment integration and analytics dashboard he built are exceptional.",
    rating: 5,
    projectId: "",
    experienceId: "",
    featured: true,
    disabled: false,
    priority: 85,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    clientName: "Karim Boudiaf",
    clientTitle: "Lead Engineer",
    clientCompany: "Techno DZ",
    clientPhoto: "",
    content:
      "The ETL pipeline Mounir built processes 5TB+ daily with 99.95% accuracy. His expertise in Python, Airflow and Kubernetes is truly impressive.",
    rating: 5,
    projectId: "",
    experienceId: "",
    featured: true,
    disabled: false,
    priority: 80,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const applyFallback = (prefix = "local") => {
      setTestimonials(
        FALLBACK_TESTIMONIALS.map((t, i) => ({
          id: `${prefix}-testimonial-${i}`,
          ...t,
        }))
      );
      setLoading(false);
    };

    if (!isFirebaseEnabled || !db) {
      applyFallback();
      return;
    }

    const q = query(
      collection(db, COLLECTIONS.TESTIMONIALS),
      where("disabled", "==", false),
      orderBy("priority", "desc"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setTestimonials(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as TestimonialSchema))
        );
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[useTestimonials] onSnapshot error:", err);
        setError(err.message);
        applyFallback("fallback");
      }
    );

    return () => unsub();
  }, []);

  const featured = useMemo(
    () => testimonials.filter((t) => t.featured),
    [testimonials]
  );

  return { testimonials, featured, loading, error };
}

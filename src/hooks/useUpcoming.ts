import { useEffect, useState } from "react";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";

export type UpcomingStatus = "idea" | "planned" | "in-development" | "beta" | "soon";

export interface UpcomingProject {
  id: string;
  title: string;
  description: string;
  status: UpcomingStatus;
  targetDate?: string;
  technologies: string[];
  category?: string;
  estimatedDuration?: string;
  publicVisible: boolean;
  priority: number;
  githubUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export type UpcomingProjectInput = Omit<UpcomingProject, "id" | "createdAt" | "updatedAt">;

export const UPCOMING_COLLECTION = "upcoming_projects";

export function useUpcoming() {
  const [upcoming, setUpcoming] = useState<UpcomingProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseEnabled || !db) {
      try {
        const stored = JSON.parse(localStorage.getItem("portfolio_upcoming") || "[]");
        setUpcoming(stored);
      } catch {
        setUpcoming([]);
      }
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, UPCOMING_COLLECTION),
      orderBy("priority", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as UpcomingProject));
        setUpcoming(data);
        setLoading(false);
      },
      () => {
        try {
          const stored = JSON.parse(localStorage.getItem("portfolio_upcoming") || "[]");
          setUpcoming(stored);
        } catch {
          setUpcoming([]);
        }
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const addUpcoming = async (data: UpcomingProjectInput) => {
    if (!isFirebaseEnabled || !db) {
      const item: UpcomingProject = { ...data, id: Date.now().toString(), createdAt: Date.now(), updatedAt: Date.now() };
      const updated = [...upcoming, item];
      setUpcoming(updated);
      localStorage.setItem("portfolio_upcoming", JSON.stringify(updated));
      return;
    }
    await addDoc(collection(db, UPCOMING_COLLECTION), {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const updateUpcoming = async (id: string, data: Partial<UpcomingProjectInput>) => {
    if (!isFirebaseEnabled || !db) {
      const updated = upcoming.map((u) => u.id === id ? { ...u, ...data, updatedAt: Date.now() } : u);
      setUpcoming(updated);
      localStorage.setItem("portfolio_upcoming", JSON.stringify(updated));
      return;
    }
    await updateDoc(doc(db, UPCOMING_COLLECTION, id), { ...data, updatedAt: Date.now() });
  };

  const deleteUpcoming = async (id: string) => {
    if (!isFirebaseEnabled || !db) {
      const updated = upcoming.filter((u) => u.id !== id);
      setUpcoming(updated);
      localStorage.setItem("portfolio_upcoming", JSON.stringify(updated));
      return;
    }
    await deleteDoc(doc(db, UPCOMING_COLLECTION, id));
  };

  return { upcoming, loading, addUpcoming, updateUpcoming, deleteUpcoming };
}

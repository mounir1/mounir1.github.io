/**
 * useFirestoreCRUD – Generic Firestore CRUD hook with:
 *  - Typed add / update / delete / batchWrite operations
 *  - Optimistic UI (instant local state update, rollback on error)
 *  - Real-time subscription via onSnapshot
 *  - Automatic fallback to local seed data when Firebase is disabled
 *  - Error recovery and loading states
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { db, isFirebaseEnabled } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CRUDDocument {
  id: string;
  createdAt: number;
  updatedAt: number;
  disabled?: boolean;
  priority?: number;
  [key: string]: unknown;
}

export interface CRUDOptions<T extends CRUDDocument> {
  collectionName: string;
  fallbackData?: Omit<T, "id">[];
  queryConstraints?: QueryConstraint[];
  includeDisabled?: boolean;
}

export interface CRUDState<T extends CRUDDocument> {
  documents: T[];
  loading: boolean;
  error: string | null;
  add: (data: Omit<T, "id" | "createdAt" | "updatedAt">) => Promise<string | null>;
  update: (id: string, data: Partial<Omit<T, "id">>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  batchUpdate: (updates: Array<{ id: string; data: Partial<Omit<T, "id">> }>) => Promise<boolean>;
  toggleField: (id: string, field: keyof T) => Promise<boolean>;
  clearError: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useFirestoreCRUD<T extends CRUDDocument>(
  opts: CRUDOptions<T>
): CRUDState<T> {
  const { collectionName, fallbackData = [], queryConstraints = [], includeDisabled = false } = opts;

  const [documents, setDocuments] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousDocs = useRef<T[]>([]);

  const applyFallback = useCallback(() => {
    const local = fallbackData.map((d, i) => ({
      id: `local-${collectionName}-${i}`,
      ...d,
    })) as T[];
    setDocuments(local);
    setLoading(false);
  }, [fallbackData, collectionName]);

  const handleFirebaseError = useCallback(
    (err: unknown, rollback?: T[]) => {
      const msg = err instanceof Error ? err.message : "Firebase operation failed";
      console.error(`[${collectionName}] Firebase error:`, err);
      setError(msg);
      if (rollback) setDocuments(rollback);
    },
    [collectionName]
  );

  useEffect(() => {
    if (!isFirebaseEnabled || !db) {
      applyFallback();
      return;
    }

    const constraints: QueryConstraint[] = [];
    if (!includeDisabled) constraints.push(where("disabled", "==", false));
    constraints.push(orderBy("priority", "desc"), orderBy("createdAt", "desc"));
    constraints.push(...queryConstraints);

    const q = query(collection(db, collectionName), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
        previousDocs.current = docs;
        setDocuments(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`[${collectionName}] onSnapshot error:`, err);
        applyFallback();
        setError((err as Error).message);
      }
    );

    return () => unsubscribe();
  }, [collectionName, includeDisabled, applyFallback]); // eslint-disable-line react-hooks/exhaustive-deps

  const add = useCallback(
    async (data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<string | null> => {
      if (!isFirebaseEnabled || !db) { setError("Firebase not enabled"); return null; }
      const now = Date.now();
      const payload = { ...data, createdAt: now, updatedAt: now };
      const tempId = `optimistic-${Date.now()}`;
      const optimisticDoc = { id: tempId, ...payload } as T;
      const snapshot = [...documents];
      setDocuments((prev) => [optimisticDoc, ...prev]);
      try {
        const ref = await addDoc(collection(db, collectionName), payload);
        setDocuments((prev) => prev.map((d) => (d.id === tempId ? { ...d, id: ref.id } : d)));
        return ref.id;
      } catch (err) {
        handleFirebaseError(err, snapshot);
        return null;
      }
    },
    [collectionName, documents, handleFirebaseError]
  );

  const update = useCallback(
    async (id: string, data: Partial<Omit<T, "id">>): Promise<boolean> => {
      if (!isFirebaseEnabled || !db) { setError("Firebase not enabled"); return false; }
      const now = Date.now();
      const payload = { ...data, updatedAt: now };
      const snapshot = [...documents];
      setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...payload } : d)));
      try {
        await updateDoc(doc(db, collectionName, id), payload as DocumentData);
        return true;
      } catch (err) {
        handleFirebaseError(err, snapshot);
        return false;
      }
    },
    [collectionName, documents, handleFirebaseError]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isFirebaseEnabled || !db) { setError("Firebase not enabled"); return false; }
      const snapshot = [...documents];
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      try {
        await deleteDoc(doc(db, collectionName, id));
        return true;
      } catch (err) {
        handleFirebaseError(err, snapshot);
        return false;
      }
    },
    [collectionName, documents, handleFirebaseError]
  );

  const batchUpdate = useCallback(
    async (updates: Array<{ id: string; data: Partial<Omit<T, "id">> }>): Promise<boolean> => {
      if (!isFirebaseEnabled || !db) { setError("Firebase not enabled"); return false; }
      const now = Date.now();
      const snapshot = [...documents];
      setDocuments((prev) =>
        prev.map((d) => {
          const match = updates.find((u) => u.id === d.id);
          return match ? { ...d, ...match.data, updatedAt: now } : d;
        })
      );
      try {
        const batch = writeBatch(db);
        for (const { id, data } of updates) {
          batch.update(doc(db, collectionName, id), { ...(data as DocumentData), updatedAt: now });
        }
        await batch.commit();
        return true;
      } catch (err) {
        handleFirebaseError(err, snapshot);
        return false;
      }
    },
    [collectionName, documents, handleFirebaseError]
  );

  const toggleField = useCallback(
    async (id: string, field: keyof T): Promise<boolean> => {
      const doc_ = documents.find((d) => d.id === id);
      if (!doc_) return false;
      const current = doc_[field] as boolean;
      return update(id, { [field]: !current } as Partial<Omit<T, "id">>);
    },
    [documents, update]
  );

  const clearError = useCallback(() => setError(null), []);

  return { documents, loading, error, add, update, remove, batchUpdate, toggleField, clearError };
}

import { useEffect, useState } from "react";
import { isFirebaseEnabled } from "@/lib/firebase-config";
import { getDb } from "@/lib/firestore-client";
import { sanitizeDoc } from "@/utils/firestore-write";

export type MessageStatus = "unread" | "read" | "replied" | "archived" | "spam";
export type MessageType = "general" | "project" | "hire" | "collaboration" | "other";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  company?: string;
  budget?: string;
  type: MessageType;
  status: MessageStatus;
  metadata?: {
    userAgent?: string;
    referrer?: string;
    page?: string;
  };
  createdAt: number;
  readAt?: number;
  repliedAt?: number;
}

export type ContactMessageInput = Omit<ContactMessage, "id" | "createdAt" | "status">;

export const CONTACT_COLLECTION = "contact_messages";

export function useContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  // No remote source without Firebase — skip the loading state entirely.
  const [loading, setLoading] = useState(isFirebaseEnabled);

  useEffect(() => {
    if (!isFirebaseEnabled) {
      return;
    }

    let unsub: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      try {
        const [{ collection, onSnapshot, doc: docRef, orderBy, query }, db] = await Promise.all([
          import("firebase/firestore"),
          getDb(),
        ]);
        if (cancelled) return;

        const q = query(collection(db, CONTACT_COLLECTION), orderBy("createdAt", "desc"));
        unsub = onSnapshot(q, (snap) => {
          setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactMessage)));
          setLoading(false);
        }, () => setLoading(false));
      } catch {
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const submitMessage = async (data: ContactMessageInput) => {
    if (!isFirebaseEnabled) return;
    const [{ addDoc, collection }, db] = await Promise.all([
      import("firebase/firestore"),
      getDb(),
    ]);
    await addDoc(collection(db, CONTACT_COLLECTION), sanitizeDoc({
      ...data,
      status: "unread",
      createdAt: Date.now(),
    }));
  };

  const markRead = async (id: string) => {
    if (!isFirebaseEnabled) return;
    const [{ updateDoc, doc: docRef }, db] = await Promise.all([
      import("firebase/firestore"),
      getDb(),
    ]);
    return updateDoc(docRef(db, CONTACT_COLLECTION, id), { status: "read", readAt: Date.now() });
  };

  const markReplied = async (id: string) => {
    if (!isFirebaseEnabled) return;
    const [{ updateDoc, doc: docRef }, db] = await Promise.all([
      import("firebase/firestore"),
      getDb(),
    ]);
    return updateDoc(docRef(db, CONTACT_COLLECTION, id), { status: "replied", repliedAt: Date.now() });
  };

  const markStatus = async (id: string, status: MessageStatus) => {
    if (!isFirebaseEnabled) return;
    const [{ updateDoc, doc: docRef }, db] = await Promise.all([
      import("firebase/firestore"),
      getDb(),
    ]);
    return updateDoc(docRef(db, CONTACT_COLLECTION, id), { status });
  };

  const deleteMessage = async (id: string) => {
    if (!isFirebaseEnabled) return;
    const [{ deleteDoc, doc: docRef }, db] = await Promise.all([
      import("firebase/firestore"),
      getDb(),
    ]);
    return deleteDoc(docRef(db, CONTACT_COLLECTION, id));
  };

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return { messages, loading, submitMessage, markRead, markReplied, markStatus, deleteMessage, unreadCount };
}

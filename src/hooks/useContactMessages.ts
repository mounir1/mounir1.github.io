import { useEffect, useState } from "react";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import {
  collection, onSnapshot, addDoc, updateDoc,
  doc, orderBy, query,
} from "firebase/firestore";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseEnabled || !db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, CONTACT_COLLECTION), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactMessage)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const submitMessage = async (data: ContactMessageInput) => {
    await addDoc(collection(db!, CONTACT_COLLECTION), {
      ...data,
      status: "unread",
      createdAt: Date.now(),
    });
  };

  const markRead = (id: string) =>
    updateDoc(doc(db!, CONTACT_COLLECTION, id), { status: "read", readAt: Date.now() });

  const markReplied = (id: string) =>
    updateDoc(doc(db!, CONTACT_COLLECTION, id), { status: "replied", repliedAt: Date.now() });

  const markStatus = (id: string, status: MessageStatus) =>
    updateDoc(doc(db!, CONTACT_COLLECTION, id), { status });

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return { messages, loading, submitMessage, markRead, markReplied, markStatus, unreadCount };
}

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

export const DEFAULT_UPCOMING: UpcomingProject[] = [
  {
    id: "u1",
    title: "TechnoStationery Dashboard — AI-Powered Operations Hub",
    description:
      "Unified task management, real-time server monitoring, Telegram & Slack bot integrations, and AI-generated weekly/monthly operational reports. A single pane of glass for the TechnoStationery engineering and ops team.",
    status: "in-development",
    targetDate: "2025-Q3",
    technologies: [
      "React", "TypeScript", "Node.js", "Firebase",
      "Telegram Bot API", "Slack API", "OpenAI API",
      "Prometheus", "Grafana", "WebSocket", "Docker",
    ],
    category: "Operations & Monitoring",
    estimatedDuration: "6 months",
    publicVisible: true,
    priority: 100,
    githubUrl: "",
    createdAt: 1735689600000,
    updatedAt: 1746057600000,
  },
  {
    id: "u2",
    title: "mounirtms — TMS Modules v2 for Magento 2.4+",
    description:
      "Next-generation TMS modules for Magento 2.4+: expanded carrier integrations, GraphQL support, real-time tracking webhooks, and a new multi-carrier rate-shopping engine.",
    status: "planned",
    targetDate: "2025-Q4",
    technologies: [
      "PHP 8.2", "Magento 2.4+", "GraphQL", "MySQL",
      "Redis", "REST APIs", "Composer", "Docker",
    ],
    category: "E-commerce / Logistics",
    estimatedDuration: "4 months",
    publicVisible: true,
    priority: 90,
    githubUrl: "https://github.com/mounirtms",
    createdAt: 1735689600000,
    updatedAt: 1746057600000,
  },
  {
    id: "u3",
    title: "HoTech — DashBoss Mobile v2",
    description:
      "Major upgrade to the DashBoss hotel operations mobile dashboard: redesigned KPI widgets, push notifications for critical alerts, offline support, and integration with the new Otello GEM AI engine.",
    status: "planned",
    targetDate: "2026-Q1",
    technologies: [
      "React Native", "TypeScript", "Node.js",
      "Firebase", "WebSocket", "AI/ML", "REST APIs",
    ],
    category: "Hospitality Technology",
    estimatedDuration: "5 months",
    publicVisible: true,
    priority: 80,
    githubUrl: "",
    createdAt: 1735689600000,
    updatedAt: 1746057600000,
  },
  {
    id: "u4",
    title: "ETL Platform v2 — Real-Time Streaming Pipeline",
    description:
      "Evolution of the ETL platform to support real-time streaming, a visual no-code workflow builder, and a cloud-agnostic connector library with Apache Kafka integration.",
    status: "idea",
    targetDate: "2026-Q2",
    technologies: [
      "Node.js", "TypeScript", "Apache Kafka",
      "React", "PostgreSQL", "Docker", "Kubernetes", "AWS",
    ],
    category: "Data Engineering",
    estimatedDuration: "6 months",
    publicVisible: true,
    priority: 70,
    githubUrl: "",
    createdAt: 1735689600000,
    updatedAt: 1746057600000,
  },
];

export function useUpcoming() {
  // Local fallback resolved during lazy state init — no synchronous setState
  // in the effect (react-hooks/set-state-in-effect) and no empty-state flash.
  const [upcoming, setUpcoming] = useState<UpcomingProject[]>(() => {
    if (isFirebaseEnabled && db) return [];
    try {
      const stored = JSON.parse(localStorage.getItem("portfolio_upcoming") || "[]");
      return stored.length > 0 ? stored : DEFAULT_UPCOMING;
    } catch {
      return DEFAULT_UPCOMING;
    }
  });
  const [loading, setLoading] = useState(isFirebaseEnabled && !!db);

  useEffect(() => {
    // Local data already seeded via lazy init when Firebase is disabled
    if (!isFirebaseEnabled || !db) {
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
        setUpcoming(data.length > 0 ? data : DEFAULT_UPCOMING);
        setLoading(false);
      },
      () => {
        try {
          const stored = JSON.parse(localStorage.getItem("portfolio_upcoming") || "[]");
          setUpcoming(stored.length > 0 ? stored : DEFAULT_UPCOMING);
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

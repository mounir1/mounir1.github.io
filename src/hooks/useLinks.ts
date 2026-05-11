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

export interface PortfolioLink {
  id: string;
  label: string;
  url: string;
  category: string;
  description: string;
  icon?: string;
  active: boolean;
  priority: number;
  openInNewTab: boolean;
  createdAt: number;
  updatedAt: number;
}

export type PortfolioLinkInput = Omit<PortfolioLink, "id" | "createdAt" | "updatedAt">;

export const LINKS_COLLECTION = "links";

export const DEFAULT_LINKS: PortfolioLink[] = [
  // ── Enterprise Solutions ─────────────────────────────────────────────────────
  { id: "d1",  label: "hotech.systems",               url: "https://hotech.systems",                  category: "Enterprise Solutions",     description: "Hospitality digital transformation — Otello GEM, DashBoss, GuestApp",          active: true, priority: 100, openInNewTab: true, createdAt: 0, updatedAt: 0 },
  { id: "d2",  label: "HoTech EN",                    url: "https://en.hotech.systems",               category: "Enterprise Solutions",     description: "English portal for HoTech Systems — global hospitality tech",                   active: true, priority: 95,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  { id: "d3",  label: "technostationery.com",         url: "https://technostationery.com",            category: "Enterprise Solutions",     description: "E-commerce platform for office supplies and stationery",                       active: true, priority: 90,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  { id: "d4",  label: "Dashboard · AI · Monitoring",  url: "https://dashboard.technostationery.com",  category: "Enterprise Solutions",     description: "Task management, server monitoring & AI reporting hub — upcoming",             active: true, priority: 88,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  { id: "d5",  label: "ETL Platform",                 url: "https://etl.techno-dz.com",               category: "Enterprise Solutions",     description: "High-performance ETL data processing and transformation platform",             active: true, priority: 80,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  // ── Magento & Adobe Commerce ─────────────────────────────────────────────────
  { id: "d6",  label: "mab-modules.github.io",        url: "https://mab-modules.github.io",           category: "Magento & Adobe Commerce", description: "Open-source Adobe Commerce / Magento 2 module library by MAB",                active: true, priority: 75,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  { id: "d7",  label: "mounirtms.github.io",          url: "https://mounirtms.github.io",             category: "Magento & Adobe Commerce", description: "Magento 2 TMS & logistics modules — carrier integrations, shipping automation", active: true, priority: 72,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  { id: "d8",  label: "GitHub: mab-modules",          url: "https://github.com/mab-modules",          category: "Magento & Adobe Commerce", description: "MAB Modules GitHub organisation — open-source Magento ecosystem",             active: true, priority: 68,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  { id: "d9",  label: "GitHub: mounirtms",            url: "https://github.com/mounirtms",            category: "Magento & Adobe Commerce", description: "mounirtms GitHub — TMS & logistics Magento 2 modules",                        active: true, priority: 65,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  // ── Web Applications ─────────────────────────────────────────────────────────
  { id: "d10", label: "JSKit App",                    url: "https://jskit-app.web.app",               category: "Web Applications",         description: "Comprehensive JavaScript development toolkit for rapid app building",          active: true, priority: 60,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  { id: "d11", label: "Noor Al Maarifa",              url: "https://www.nooralmaarifa.com",           category: "Web Applications",         description: "Arabic educational platform for Islamic knowledge and learning",              active: true, priority: 55,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  { id: "d12", label: "IT Collaborator",              url: "https://it-collaborator-techno.web.app",  category: "Web Applications",         description: "Project management & team collaboration platform for IT teams",                active: true, priority: 50,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
];

export function useLinks() {
  const [links, setLinks] = useState<PortfolioLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseEnabled || !db) {
      // Fallback: try localStorage, else use defaults
      try {
        const stored = JSON.parse(localStorage.getItem("portfolio_links") || "[]");
        setLinks(stored.length > 0 ? stored : DEFAULT_LINKS);
      } catch {
        setLinks(DEFAULT_LINKS);
      }
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, LINKS_COLLECTION),
      orderBy("priority", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PortfolioLink));
        setLinks(data.length > 0 ? data : DEFAULT_LINKS);
        setLoading(false);
      },
      () => {
        try {
          const stored = JSON.parse(localStorage.getItem("portfolio_links") || "[]");
          setLinks(stored.length > 0 ? stored : DEFAULT_LINKS);
        } catch {
          setLinks(DEFAULT_LINKS);
        }
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const addLink = async (data: PortfolioLinkInput) => {
    if (!isFirebaseEnabled || !db) {
      const newLink: PortfolioLink = { ...data, id: Date.now().toString(), createdAt: Date.now(), updatedAt: Date.now() };
      const updated = [...links.filter(l => l.id.startsWith("d") === false || l.id === newLink.id), newLink];
      setLinks(updated);
      localStorage.setItem("portfolio_links", JSON.stringify(updated));
      return;
    }
    await addDoc(collection(db, LINKS_COLLECTION), {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const updateLink = async (id: string, data: Partial<PortfolioLinkInput>) => {
    if (!isFirebaseEnabled || !db) {
      const updated = links.map((l) => l.id === id ? { ...l, ...data, updatedAt: Date.now() } : l);
      setLinks(updated);
      localStorage.setItem("portfolio_links", JSON.stringify(updated));
      return;
    }
    await updateDoc(doc(db, LINKS_COLLECTION, id), { ...data, updatedAt: Date.now() });
  };

  const deleteLink = async (id: string) => {
    if (!isFirebaseEnabled || !db) {
      const updated = links.filter((l) => l.id !== id);
      setLinks(updated);
      localStorage.setItem("portfolio_links", JSON.stringify(updated));
      return;
    }
    await deleteDoc(doc(db, LINKS_COLLECTION, id));
  };

  const seedDefaults = async () => {
    for (const link of DEFAULT_LINKS) {
      const { id: _id, ...data } = link;
      await addLink({ ...data });
    }
  };

  return { links, loading, addLink, updateLink, deleteLink, seedDefaults };
}

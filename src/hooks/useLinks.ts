import { useEffect, useState } from "react";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  setDoc,
  doc,
  orderBy,
  query,
  getDocs,
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
  // etl.techno-dz.com is an internal deployment (no public DNS, curl 000 2025-08) — link the open-source repo instead (verified 200).
  { id: "d5",  label: "ETL Scripts",                  url: "https://github.com/mounirtms/ETL-scripts", category: "Enterprise Solutions",    description: "High-performance ETL data processing and transformation scripts (open source)", active: true, priority: 80,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  // ── Magento & Adobe Commerce ─────────────────────────────────────────────────
  // mab-modules.github.io and github.com/mab-modules returned 404 (2025-08) — removed until the org/site is live. Re-add via Admin → Links.
  { id: "d7",  label: "mounirtms.github.io",          url: "https://mounirtms.github.io",             category: "Magento & Adobe Commerce", description: "Magento 2 TMS & logistics modules — carrier integrations, shipping automation", active: true, priority: 72,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  { id: "d8",  label: "GitHub: mounir1",              url: "https://github.com/mounir1",              category: "Magento & Adobe Commerce", description: "Primary GitHub — portfolio, web apps and open-source work",                   active: true, priority: 68,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  { id: "d9",  label: "GitHub: mounirtms",            url: "https://github.com/mounirtms",            category: "Magento & Adobe Commerce", description: "mounirtms GitHub — TMS & logistics Magento 2 modules",                        active: true, priority: 65,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  // ── Web Applications ─────────────────────────────────────────────────────────
  { id: "d10", label: "JSKit App",                    url: "https://jskit-app.web.app",               category: "Web Applications",         description: "Comprehensive JavaScript development toolkit for rapid app building",          active: true, priority: 60,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  { id: "d11", label: "Noor Al Maarifa",              url: "https://www.nooralmaarifa.com",           category: "Web Applications",         description: "Arabic educational platform for Islamic knowledge and learning",              active: true, priority: 55,  openInNewTab: true, createdAt: 0, updatedAt: 0 },
  // it-collaborator-techno.web.app returned 404 (2025-08) — Firebase hosting no longer serving. Re-add via Admin → Links when redeployed.
];

export function useLinks() {
  // Local fallback resolved during lazy state init — no synchronous setState
  // in the effect (react-hooks/set-state-in-effect) and no empty-state flash.
  const [links, setLinks] = useState<PortfolioLink[]>(() => {
    if (isFirebaseEnabled && db) return [];
    try {
      const stored = JSON.parse(localStorage.getItem("portfolio_links") || "[]");
      return stored.length > 0 ? stored : DEFAULT_LINKS;
    } catch {
      return DEFAULT_LINKS;
    }
  });
  const [loading, setLoading] = useState(isFirebaseEnabled && !!db);

  useEffect(() => {
    // Local data already seeded via lazy init when Firebase is disabled
    if (!isFirebaseEnabled || !db) {
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

  /**
   * When the Firestore collection is empty the UI displays DEFAULT_LINKS as a
   * fallback — but those docs (ids d1…d12) don't exist in Firestore, so a
   * plain updateDoc/deleteDoc would throw "No document to update". Before the
   * first mutation we materialise ALL defaults into Firestore (keeping their
   * ids) so every displayed row is backed by a real doc and later snapshots
   * stay complete. No-op once the collection has any docs.
   */
  const ensureSeeded = async () => {
    if (!isFirebaseEnabled || !db) return;
    const snap = await getDocs(collection(db, LINKS_COLLECTION));
    if (!snap.empty) return;
    const now = Date.now();
    await Promise.all(
      DEFAULT_LINKS.map(({ id, ...data }) =>
        setDoc(doc(db!, LINKS_COLLECTION, id), { ...data, createdAt: now, updatedAt: now })
      )
    );
  };

  const addLink = async (data: PortfolioLinkInput) => {
    if (!isFirebaseEnabled || !db) {
      const newLink: PortfolioLink = { ...data, id: Date.now().toString(), createdAt: Date.now(), updatedAt: Date.now() };
      const updated = [...links.filter(l => l.id.startsWith("d") === false || l.id === newLink.id), newLink];
      setLinks(updated);
      localStorage.setItem("portfolio_links", JSON.stringify(updated));
      return;
    }
    await ensureSeeded();
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
    await ensureSeeded();
    // setDoc+merge is an upsert — never throws "No document to update".
    await setDoc(doc(db, LINKS_COLLECTION, id), { ...data, updatedAt: Date.now() }, { merge: true });
  };

  const deleteLink = async (id: string) => {
    if (!isFirebaseEnabled || !db) {
      const updated = links.filter((l) => l.id !== id);
      setLinks(updated);
      localStorage.setItem("portfolio_links", JSON.stringify(updated));
      return;
    }
    await ensureSeeded();
    await deleteDoc(doc(db, LINKS_COLLECTION, id));
  };

  const seedDefaults = async () => {
    if (!isFirebaseEnabled || !db) {
      setLinks(DEFAULT_LINKS);
      localStorage.setItem("portfolio_links", JSON.stringify(DEFAULT_LINKS));
      return;
    }
    // Materialise defaults with stable ids (no-op if collection already has docs).
    await ensureSeeded();
  };

  return { links, loading, addLink, updateLink, deleteLink, seedDefaults };
}

import { useCallback, useEffect, useRef } from "react";
import { collection, addDoc, query, orderBy, getDocs, limit, where } from "firebase/firestore";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/database-schema";

type EventType = "page_view" | "project_view" | "contact_form" | "cv_download" | "link_click" | "section_view" | "testimonial_view";

interface TrackOptions {
  page?: string;
  projectId?: string;
  section?: string;
  label?: string;
  referrer?: string;
}

let _sessionId: string | null = null;
function getSessionId() {
  if (_sessionId) return _sessionId;
  const stored = sessionStorage.getItem("_analytics_sid");
  if (stored) { _sessionId = stored; return stored; }
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  sessionStorage.setItem("_analytics_sid", id);
  _sessionId = id;
  return id;
}

async function track(type: EventType, opts: TrackOptions = {}) {
  if (!isFirebaseEnabled || !db) return;
  try {
    await addDoc(collection(db, COLLECTIONS.ANALYTICS), {
      type,
      metadata: {
        page: opts.page ?? location.pathname,
        projectId: opts.projectId,
        section: opts.section,
        label: opts.label,
        referrer: opts.referrer ?? document.referrer,
        userAgent: navigator.userAgent.slice(0, 100),
        device: /Mobile|Android|iPhone/.test(navigator.userAgent) ? "mobile" : "desktop",
      },
      sessionId: getSessionId(),
      timestamp: Date.now(),
    });
  } catch { /* silently fail */ }
}

export function useAnalytics() {
  const tracked = useRef(new Set<string>());

  const trackPage = useCallback((page?: string) => {
    const key = `page:${page ?? location.pathname}`;
    if (tracked.current.has(key)) return;
    tracked.current.add(key);
    void track("page_view", { page });
  }, []);

  const trackProject = useCallback((projectId: string, label?: string) => {
    void track("project_view", { projectId, label });
  }, []);

  const trackSection = useCallback((section: string) => {
    const key = `section:${section}`;
    if (tracked.current.has(key)) return;
    tracked.current.add(key);
    void track("section_view", { section });
  }, []);

  const trackCV = useCallback(() => {
    void track("cv_download", { label: "cv_download" });
  }, []);

  const trackContact = useCallback(() => {
    void track("contact_form");
  }, []);

  const trackLink = useCallback((label: string, page?: string) => {
    void track("link_click", { label, page });
  }, []);

  return { trackPage, trackProject, trackSection, trackCV, trackContact, trackLink };
}

export function useSectionTracker(sectionId: string) {
  const ref = useRef<HTMLElement | null>(null);
  const { trackSection } = useAnalytics();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) trackSection(sectionId); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [sectionId, trackSection]);

  return ref;
}

export async function fetchRecentEvents(type?: EventType, maxItems = 100) {
  if (!isFirebaseEnabled || !db) return [];
  try {
    const constraints = type
      ? [where("type", "==", type), orderBy("timestamp", "desc"), limit(maxItems)]
      : [orderBy("timestamp", "desc"), limit(maxItems)];
    const snap = await getDocs(query(collection(db, COLLECTIONS.ANALYTICS), ...constraints));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch { return []; }
}

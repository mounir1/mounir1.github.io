/**
 * useAnalytics – Track events + query aggregated analytics from Firestore.
 * Provides trackEvent() helper + aggregated counts for the Admin dashboard.
 */

import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import type { AnalyticsSchema } from "@/lib/database-schema";
import { COLLECTIONS } from "@/lib/database-schema";

// ── Types ──────────────────────────────────────────────────────────────────────

export type AnalyticsEventType = AnalyticsSchema["type"];

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsSummary {
  totalPageViews: number;
  totalProjectViews: number;
  totalCVDownloads: number;
  totalContactForms: number;
  totalLinkClicks: number;
  recentEvents: AnalyticsSchema[];
  topProjects: Array<{ projectId: string; views: number }>;
  loading: boolean;
  error: string | null;
}

// ── Session ID (persisted per tab) ────────────────────────────────────────────

let _sessionId: string | null = null;
function getSessionId(): string {
  if (!_sessionId) {
    _sessionId =
      sessionStorage.getItem("portfolio_session") ??
      `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem("portfolio_session", _sessionId);
  }
  return _sessionId;
}

// ── trackEvent (standalone util) ─────────────────────────────────────────────

export async function trackEvent(
  event: AnalyticsEvent
): Promise<void> {
  if (!isFirebaseEnabled || !db) return;
  try {
    await addDoc(collection(db, COLLECTIONS.ANALYTICS), {
      type: event.type,
      metadata: {
        page: window.location.pathname,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
        ...event.metadata,
      },
      timestamp: Date.now(),
      sessionId: getSessionId(),
    } satisfies Omit<AnalyticsSchema, "id">);
  } catch {
    // Analytics failures are silent – never block the user
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAnalyticsSummary(): AnalyticsSummary {
  const [summary, setSummary] = useState<Omit<AnalyticsSummary, "loading" | "error">>({
    totalPageViews: 0,
    totalProjectViews: 0,
    totalCVDownloads: 0,
    totalContactForms: 0,
    totalLinkClicks: 0,
    recentEvents: [],
    topProjects: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseEnabled || !db) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Recent 200 events for aggregation
        const recentQ = query(
          collection(db!, COLLECTIONS.ANALYTICS),
          orderBy("timestamp", "desc"),
          limit(200)
        );

        const snap = await getDocs(recentQ);
        const events = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as AnalyticsSchema)
        );

        // Count by type
        const counts: Record<AnalyticsEventType, number> = {
          page_view: 0,
          project_view: 0,
          contact_form: 0,
          cv_download: 0,
          link_click: 0,
        };
        const projectViewCount: Record<string, number> = {};

        for (const ev of events) {
          counts[ev.type] = (counts[ev.type] ?? 0) + 1;
          if (ev.type === "project_view" && ev.metadata?.projectId) {
            const pid = String(ev.metadata.projectId);
            projectViewCount[pid] = (projectViewCount[pid] ?? 0) + 1;
          }
        }

        const topProjects = Object.entries(projectViewCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([projectId, views]) => ({ projectId, views }));

        setSummary({
          totalPageViews: counts.page_view,
          totalProjectViews: counts.project_view,
          totalCVDownloads: counts.cv_download,
          totalContactForms: counts.contact_form,
          totalLinkClicks: counts.link_click,
          recentEvents: events.slice(0, 20),
          topProjects,
        });
        setError(null);
      } catch (err) {
        console.error("[useAnalyticsSummary]", err);
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { ...summary, loading, error };
}

// ── Page-view auto-tracker hook ───────────────────────────────────────────────

export function usePageTracking(page: string) {
  const track = useCallback(() => {
    trackEvent({ type: "page_view", metadata: { page } });
  }, [page]);

  useEffect(() => {
    track();
  }, [track]);
}

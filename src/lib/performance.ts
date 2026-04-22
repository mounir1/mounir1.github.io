/**
 * Performance Monitoring Library
 * – Web Vitals (LCP, FID, CLS, FCP, TTFB, INP)
 * – Firebase Performance traces (optional)
 * – Long-task observer
 * – Resource timing budget enforcement
 * – Real User Monitoring (RUM) metrics stored to Firestore analytics collection
 */

import { db, isFirebaseEnabled } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/database-schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MetricName = "LCP" | "FID" | "CLS" | "FCP" | "TTFB" | "INP" | "custom";

export interface PerformanceMetric {
  name: MetricName | string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta?: number;
  id?: string;
  navigationType?: string;
  page: string;
  timestamp: number;
  device: string;
  connection?: string;
  sessionId: string;
}

export interface ResourceEntry {
  name: string;
  type: string;
  duration: number;
  size: number;
  cached: boolean;
}

export interface PerformanceReport {
  sessionId: string;
  page: string;
  metrics: PerformanceMetric[];
  resources: ResourceEntry[];
  longTasks: number;
  memoryUsage?: number;
  timestamp: number;
}

// ─── Thresholds (Google Core Web Vitals) ─────────────────────────────────────

const THRESHOLDS: Record<string, [number, number]> = {
  LCP:  [2500, 4000],   // good < 2500ms, poor > 4000ms
  FID:  [100,  300],    // good < 100ms,  poor > 300ms
  INP:  [200,  500],    // good < 200ms,  poor > 500ms
  CLS:  [0.1,  0.25],   // good < 0.1,    poor > 0.25
  FCP:  [1800, 3000],   // good < 1800ms, poor > 3000ms
  TTFB: [800,  1800],   // good < 800ms,  poor > 1800ms
};

function getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const t = THRESHOLDS[name];
  if (!t) return "good";
  if (value <= t[0]) return "good";
  if (value <= t[1]) return "needs-improvement";
  return "poor";
}

// ─── Session ID ───────────────────────────────────────────────────────────────

let _sessionId: string | null = null;

function getSessionId(): string {
  if (_sessionId) return _sessionId;
  const stored = sessionStorage.getItem("_perf_sid");
  if (stored) { _sessionId = stored; return stored; }
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  sessionStorage.setItem("_perf_sid", id);
  _sessionId = id;
  return id;
}

// ─── Device classification ────────────────────────────────────────────────────

function getDevice(): string {
  const ua = navigator.userAgent;
  if (/Mobile|Android|iPhone|iPad/.test(ua)) return "mobile";
  if (/Tablet/.test(ua)) return "tablet";
  return "desktop";
}

function getConnection(): string | undefined {
  const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
  return nav.connection?.effectiveType;
}

// ─── Firestore reporter ───────────────────────────────────────────────────────

async function reportToFirestore(metric: PerformanceMetric): Promise<void> {
  if (!isFirebaseEnabled || !db) return;
  try {
    await addDoc(collection(db, COLLECTIONS.ANALYTICS), {
      type: "web_vital",
      metadata: {
        metricName: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        device: metric.device,
        connection: metric.connection,
        navigationType: metric.navigationType,
        page: metric.page,
      },
      sessionId: metric.sessionId,
      timestamp: serverTimestamp(),
    });
  } catch {
    // Silently fail – never block the main thread
  }
}

// ─── Metric collection queue ──────────────────────────────────────────────────

const _metrics: PerformanceMetric[] = [];
const _listeners: Array<(m: PerformanceMetric) => void> = [];

function recordMetric(name: string, value: number, extras?: Partial<PerformanceMetric>) {
  const metric: PerformanceMetric = {
    name: name as MetricName,
    value,
    rating: getRating(name, value),
    page: location.pathname,
    timestamp: Date.now(),
    device: getDevice(),
    connection: getConnection(),
    sessionId: getSessionId(),
    ...extras,
  };
  _metrics.push(metric);
  _listeners.forEach((l) => l(metric));
  void reportToFirestore(metric);
}

export function onMetric(listener: (m: PerformanceMetric) => void): () => void {
  _listeners.push(listener);
  // Replay already-collected metrics
  _metrics.forEach(listener);
  return () => {
    const i = _listeners.indexOf(listener);
    if (i !== -1) _listeners.splice(i, 1);
  };
}

export function getMetrics(): PerformanceMetric[] {
  return [..._metrics];
}

// ─── PerformanceObserver – Web Vitals ─────────────────────────────────────────

let _initDone = false;

export function initPerformanceMonitoring(): void {
  if (_initDone || typeof window === "undefined") return;
  _initDone = true;

  // ── LCP ──
  try {
    const lcpObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        recordMetric("LCP", entry.startTime);
      }
    });
    lcpObs.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}

  // ── FID / INP via event-timing ──
  try {
    const eidObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEntry & { processingStart?: number; duration?: number; interactionId?: number };
        if (e.processingStart !== undefined) {
          const fid = e.processingStart - entry.startTime;
          recordMetric("FID", fid);
        }
        if (e.duration !== undefined && e.interactionId) {
          recordMetric("INP", e.duration);
        }
      }
    });
    eidObs.observe({ type: "event", buffered: true, durationThreshold: 40 } as PerformanceObserverInit);
  } catch {}

  // ── CLS ──
  try {
    let clsValue = 0;
    const clsObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!e.hadRecentInput && e.value !== undefined) {
          clsValue += e.value;
          recordMetric("CLS", clsValue);
        }
      }
    });
    clsObs.observe({ type: "layout-shift", buffered: true });
  } catch {}

  // ── FCP + TTFB from navigation timing ──
  try {
    const paintObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          recordMetric("FCP", entry.startTime);
        }
      }
    });
    paintObs.observe({ type: "paint", buffered: true });
  } catch {}

  // TTFB from Navigation Timing API
  try {
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      recordMetric("TTFB", navEntries[0].responseStart);
    }
  } catch {}

  // ── Long Tasks ──
  try {
    const ltObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        recordMetric("custom", entry.duration, { name: "long-task" });
      }
    });
    ltObs.observe({ type: "longtask", buffered: true });
  } catch {}

  // ── Periodic memory snapshot ──
  const perf = performance as Performance & { memory?: { usedJSHeapSize?: number; jsHeapSizeLimit?: number } };
  if (perf.memory) {
    setInterval(() => {
      if (!perf.memory?.usedJSHeapSize) return;
      const mb = perf.memory.usedJSHeapSize / 1_048_576;
      recordMetric("custom", mb, { name: "heap-mb" });
    }, 30_000);
  }
}

// ─── Resource timing audit ─────────────────────────────────────────────────────

export function auditResources(budgetKB = 500): ResourceEntry[] {
  const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  return entries
    .map((e) => ({
      name: e.name,
      type: e.initiatorType,
      duration: Math.round(e.duration),
      size: Math.round((e.transferSize ?? 0) / 1024),
      cached: e.transferSize === 0 && e.decodedBodySize > 0,
    }))
    .filter((r) => r.size > budgetKB);
}

// ─── Custom trace helper (wraps async operations) ────────────────────────────

export async function trace<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    recordMetric("custom", performance.now() - start, { name });
    return result;
  } catch (err) {
    recordMetric("custom", performance.now() - start, { name: `${name}-error` });
    throw err;
  }
}

// ─── Metric Summaries (for admin dashboard) ───────────────────────────────────

export interface MetricSummary {
  name: string;
  latest: number;
  avg: number;
  p75: number;
  p95: number;
  count: number;
  good: number;
  needsImprovement: number;
  poor: number;
  unit: string;
}

export function getMetricSummaries(): MetricSummary[] {
  const grouped: Record<string, PerformanceMetric[]> = {};
  for (const m of _metrics) {
    const key = m.name;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  }

  const UNITS: Record<string, string> = {
    LCP: "ms", FID: "ms", INP: "ms", FCP: "ms", TTFB: "ms",
    CLS: "score", "long-task": "ms", "heap-mb": "MB",
  };

  return Object.entries(grouped).map(([name, list]) => {
    const values = list.map((m) => m.value).sort((a, b) => a - b);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const p75 = values[Math.floor(values.length * 0.75)] ?? 0;
    const p95 = values[Math.floor(values.length * 0.95)] ?? 0;
    return {
      name,
      latest: values[values.length - 1] ?? 0,
      avg: Math.round(avg * 100) / 100,
      p75: Math.round(p75 * 100) / 100,
      p95: Math.round(p95 * 100) / 100,
      count: list.length,
      good: list.filter((m) => m.rating === "good").length,
      needsImprovement: list.filter((m) => m.rating === "needs-improvement").length,
      poor: list.filter((m) => m.rating === "poor").length,
      unit: UNITS[name] ?? "",
    };
  });
}

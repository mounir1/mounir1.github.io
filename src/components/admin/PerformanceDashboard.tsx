/**
 * PerformanceDashboard – Admin tab
 * Shows real-time Web Vitals, resource timing, memory, long tasks, and
 * stores per-session metrics in Firebase analytics collection.
 */

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity, AlertTriangle, CheckCircle, Clock, RefreshCw,
  Server, TrendingUp, Zap, HardDrive, Cpu,
} from "lucide-react";
import {
  initPerformanceMonitoring,
  onMetric,
  getMetricSummaries,
  auditResources,
  type PerformanceMetric,
  type MetricSummary,
  type ResourceEntry,
} from "@/lib/performance";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ratingColor: Record<string, string> = {
  good: "bg-emerald-500",
  "needs-improvement": "bg-amber-500",
  poor: "bg-red-500",
};

const ratingBadge: Record<string, string> = {
  good: "text-emerald-700 bg-emerald-50 border-emerald-200",
  "needs-improvement": "text-amber-700 bg-amber-50 border-amber-200",
  poor: "text-red-700 bg-red-50 border-red-200",
};

const VITAL_LABELS: Record<string, string> = {
  LCP: "Largest Contentful Paint",
  FID: "First Input Delay",
  INP: "Interaction to Next Paint",
  CLS: "Cumulative Layout Shift",
  FCP: "First Contentful Paint",
  TTFB: "Time to First Byte",
};

function fmt(value: number, unit: string): string {
  if (unit === "ms") return `${value.toFixed(0)} ms`;
  if (unit === "MB") return `${value.toFixed(1)} MB`;
  if (unit === "score") return value.toFixed(3);
  return String(value);
}

function MetricCard({ summary }: { summary: MetricSummary }) {
  const total = summary.good + summary.needsImprovement + summary.poor;
  const goodPct = total ? Math.round((summary.good / total) * 100) : 0;
  const label = VITAL_LABELS[summary.name] ?? summary.name;

  return (
    <Card className="border border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <Badge
            variant="outline"
            className={`text-xs ${ratingBadge[
              summary.poor > 0 ? "poor"
              : summary.needsImprovement > 0 ? "needs-improvement"
              : "good"
            ]}`}
          >
            {summary.poor > 0 ? "Poor" : summary.needsImprovement > 0 ? "Needs work" : "Good"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold">{fmt(summary.latest, summary.unit)}</div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="font-semibold">{fmt(summary.avg, summary.unit)}</div>
            <div className="text-muted-foreground">Avg</div>
          </div>
          <div>
            <div className="font-semibold">{fmt(summary.p75, summary.unit)}</div>
            <div className="text-muted-foreground">p75</div>
          </div>
          <div>
            <div className="font-semibold">{fmt(summary.p95, summary.unit)}</div>
            <div className="text-muted-foreground">p95</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Good rate</span>
            <span>{goodPct}%</span>
          </div>
          <Progress value={goodPct} className="h-1.5" />
        </div>

        <div className="flex gap-1">
          {[
            { label: "Good", count: summary.good, color: "bg-emerald-500" },
            { label: "NI", count: summary.needsImprovement, color: "bg-amber-500" },
            { label: "Poor", count: summary.poor, color: "bg-red-500" },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-1 text-xs">
              <span className={`w-2 h-2 rounded-full ${r.color}`} />
              {r.count} {r.label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Recent events feed ───────────────────────────────────────────────────────

function EventFeed({ events }: { events: PerformanceMetric[] }) {
  const recent = [...events].reverse().slice(0, 20);
  return (
    <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
      {recent.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No events yet – interact with the page to trigger measurements.
        </p>
      )}
      {recent.map((m, i) => (
        <div
          key={i}
          className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${ratingColor[m.rating]}`} />
            <span className="font-mono font-medium">{m.name}</span>
            <span className="text-muted-foreground">{m.page}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {m.name === "CLS" ? m.value.toFixed(4) : `${Math.round(m.value)} ms`}
            </span>
            <span className="text-muted-foreground">
              {new Date(m.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Resource audit table ─────────────────────────────────────────────────────

function ResourceTable({ resources }: { resources: ResourceEntry[] }) {
  return (
    <div className="space-y-1 max-h-60 overflow-y-auto">
      {resources.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No oversized resources detected. ✓
        </p>
      )}
      {resources.map((r, i) => (
        <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-red-50/50 border border-red-100">
          <div className="truncate max-w-[55%]">
            <span className="font-mono text-muted-foreground">[{r.type}]</span>{" "}
            {r.name.split("/").pop()}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Badge variant="outline" className="text-xs text-red-700 border-red-200">
              {r.size} KB
            </Badge>
            <span className="text-muted-foreground">{r.duration} ms</span>
            {r.cached && <Badge variant="outline" className="text-xs text-emerald-700">cached</Badge>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PerformanceDashboard() {
  const [summaries, setSummaries] = useState<MetricSummary[]>([]);
  const [events, setEvents] = useState<PerformanceMetric[]>([]);
  const [resources, setResources] = useState<ResourceEntry[]>([]);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const refresh = useCallback(() => {
    setSummaries(getMetricSummaries());
    setResources(auditResources(200)); // flag resources > 200 KB
    setLastRefresh(Date.now());
  }, []);

  useEffect(() => {
    initPerformanceMonitoring();
    // Subscribe to live metric events
    const unsub = onMetric((m) => {
      setEvents((prev) => [...prev.slice(-99), m]);
      setSummaries(getMetricSummaries());
    });
    // Initial audit
    refresh();
    // Auto-refresh every 15 seconds
    const timer = setInterval(refresh, 15_000);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [refresh]);

  const coreVitals = summaries.filter((s) =>
    ["LCP", "FID", "INP", "CLS", "FCP", "TTFB"].includes(s.name)
  );
  const customMetrics = summaries.filter((s) =>
    !["LCP", "FID", "INP", "CLS", "FCP", "TTFB"].includes(s.name)
  );

  // Overall score
  const overallGood = coreVitals.length
    ? Math.round(
        (coreVitals.filter((s) => s.poor === 0 && s.needsImprovement === 0).length /
          coreVitals.length) *
          100
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-500" />
            Performance Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time Core Web Vitals · Resource audit · Memory tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Updated {new Date(lastRefresh).toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Score banner */}
      {overallGood !== null && (
        <Card className={`border-2 ${overallGood >= 80 ? "border-emerald-200 bg-emerald-50/30" : overallGood >= 50 ? "border-amber-200 bg-amber-50/30" : "border-red-200 bg-red-50/30"}`}>
          <CardContent className="py-4 flex items-center gap-4">
            {overallGood >= 80 ? (
              <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
            ) : overallGood >= 50 ? (
              <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
            )}
            <div>
              <div className="text-lg font-bold">
                {overallGood}% of Core Web Vitals are in the "Good" range
              </div>
              <div className="text-sm text-muted-foreground">
                {overallGood >= 80
                  ? "Excellent! Your site delivers a great user experience."
                  : overallGood >= 50
                  ? "Some vitals need attention to reach Google's Good thresholds."
                  : "Several metrics are in the Poor range. Address issues below."}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Core Web Vitals grid */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" /> Core Web Vitals
        </h3>
        {coreVitals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
              Waiting for measurements… Navigate around the site to collect vitals.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreVitals.map((s) => (
              <MetricCard key={s.name} summary={s} />
            ))}
          </div>
        )}
      </div>

      {/* Custom / internal metrics */}
      {customMetrics.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> App Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customMetrics.map((s) => (
              <MetricCard key={s.name} summary={s} />
            ))}
          </div>
        </div>
      )}

      {/* Bottom row: resource audit + live feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Oversized resources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Server className="w-4 h-4 text-orange-500" />
              Oversized Resources (&gt;200 KB)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable resources={resources} />
          </CardContent>
        </Card>

        {/* Live metric feed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" />
              Live Metric Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EventFeed events={events} />
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-4 pb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5" /> Optimisation checklist
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
            {[
              "Use next-gen formats (WebP / AVIF) for all images",
              "Preload hero image with <link rel='preload'>",
              "Code-split heavy routes with React.lazy()",
              "Set Cache-Control: max-age=31536000 for static assets",
              "Minimise third-party scripts & use async/defer",
              "Avoid large layout shifts (reserve image dimensions)",
              "Use font-display: swap for web fonts",
              "Enable Brotli / gzip compression on the server",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

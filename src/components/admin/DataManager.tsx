/**
 * DataManager.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin tab: seed Firestore from canonical initial-*.ts sources.
 * Features: live doc counts, per-collection seed buttons, duplicate detection,
 * clear-and-reseed, detailed progress + result logs.
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload, Trash2, Database, CheckCircle, XCircle, Loader2,
  RefreshCw, SkipForward, AlertTriangle, Info,
} from "lucide-react";
import {
  DatabaseUploader,
  getCollectionCount,
  seedPortfolio,
  clearAndSeed,
  seedProjects,
  seedExperience,
  seedSkills,
  seedTestimonials,
  seedUpcoming,
  seedLinks,
  COLLECTIONS,
  type UploadProgress,
  type UploadResult,
} from "@/utils/database-uploader";
import { initialProjects }      from "@/data/initial-projects";
import { initialExperience }    from "@/data/initial-experience";
import { initialSkills }        from "@/data/initial-skills";
import { initialTestimonials }  from "@/data/initial-testimonials";
import { DEFAULT_UPCOMING }     from "@/hooks/useUpcoming";
import { DEFAULT_LINKS }        from "@/hooks/useLinks";
import { isFirebaseEnabled, db } from "@/lib/firebase";

// ─── Collection metadata ──────────────────────────────────────────────────────

interface ColMeta {
  key: keyof typeof COLLECTIONS;
  label: string;
  collectionName: string;
  seedCount: number;
  color: string;
  seedFn: (clearFirst?: boolean) => Promise<UploadResult>;
}

const COLS: ColMeta[] = [
  { key: "projects",     label: "Projects",      collectionName: COLLECTIONS.projects,     seedCount: initialProjects.length,     color: "blue",   seedFn: seedProjects     },
  { key: "experiences", label: "Experience",    collectionName: COLLECTIONS.experiences,  seedCount: initialExperience.length,   color: "green",  seedFn: seedExperience   },
  { key: "skills",      label: "Skills",        collectionName: COLLECTIONS.skills,       seedCount: initialSkills.length,       color: "purple", seedFn: seedSkills       },
  { key: "testimonials",label: "Testimonials",  collectionName: COLLECTIONS.testimonials, seedCount: initialTestimonials.length, color: "yellow", seedFn: seedTestimonials },
  { key: "upcoming",    label: "Upcoming",      collectionName: COLLECTIONS.upcoming,     seedCount: DEFAULT_UPCOMING.length,    color: "orange", seedFn: seedUpcoming     },
  { key: "links",       label: "Links",         collectionName: COLLECTIONS.links,        seedCount: DEFAULT_LINKS.length,       color: "cyan",   seedFn: seedLinks        },
];

const COLOR_MAP: Record<string, string> = {
  blue:   "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400",
  green:  "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400",
  purple: "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400",
  yellow: "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400",
  orange: "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400",
  cyan:   "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400",
};

// ─── Live counts hook ─────────────────────────────────────────────────────────

function useLiveCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  // Start "loading" only when Firebase is actually available — avoids setState in effect.
  const [loading, setLoading] = useState(isFirebaseEnabled && !!db);

  const refresh = useCallback(async () => {
    if (!isFirebaseEnabled || !db) return;
    // Yield to the microtask queue so all state updates happen asynchronously
    // (keeps react-hooks/set-state-in-effect satisfied when called from the mount effect).
    await Promise.resolve();
    setLoading(true);
    const entries = await Promise.all(
      COLS.map(async c => [c.collectionName, await getCollectionCount(c.collectionName)] as const)
    );
    setCounts(Object.fromEntries(entries));
    setLoading(false);
  }, []);

  // Initial data fetch on mount — state updates happen after awaits (async),
  // which is the canonical valid pattern; the rule can't see the async boundary.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void refresh(); }, [refresh]);

  return { counts, loading, refresh };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataManager() {
  const { counts, loading: countsLoading, refresh: refreshCounts } = useLiveCounts();

  const [isUploading, setIsUploading] = useState(false);
  const [activeCol, setActiveCol]     = useState<string | null>(null);
  const [progress, setProgress]       = useState<UploadProgress[]>([]);
  const [results, setResults]         = useState<UploadResult[]>([]);
  const [error, setError]             = useState<string | null>(null);

  const totalSeed = COLS.reduce((s, c) => s + c.seedCount, 0);
  const totalLive = Object.values(counts).reduce((s, n) => s + n, 0);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function trackProgress(p: UploadProgress[]) {
    setProgress(p);
  }

  async function runSeed(
    fn: () => Promise<UploadResult | UploadResult[]>,
    colLabel: string,
  ) {
    if (!isFirebaseEnabled || !db) {
      setError("Firebase is not configured. Check your environment variables.");
      return;
    }
    setIsUploading(true);
    setActiveCol(colLabel);
    setError(null);
    setResults([]);
    setProgress([]);
    try {
      const raw = await fn();
      const list = Array.isArray(raw) ? raw : [raw];
      setResults(list);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setIsUploading(false);
      setActiveCol(null);
      await refreshCounts();
    }
  }

  const handleSeedAll = () =>
    runSeed(() => {
      const u = new DatabaseUploader(trackProgress);
      return u.uploadAllData({ skipDuplicates: true });
    }, "All Collections");

  const handleClearAll = () => {
    if (!confirm("⚠️  This will DELETE all documents in all collections and re-upload fresh data. Continue?")) return;
    runSeed(() => {
      const u = new DatabaseUploader(trackProgress);
      return u.uploadAllData({ clearFirst: true, skipDuplicates: false });
    }, "All Collections (Clear + Reseed)");
  };

  const handleSeedOne = (col: ColMeta, clearFirst: boolean) => {
    if (clearFirst && !confirm(`⚠️  Delete all "${col.label}" documents and re-upload? Continue?`)) return;
    runSeed(() => col.seedFn(clearFirst), col.label);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (!isFirebaseEnabled || !db) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Firebase is not configured. Data seeding requires a live Firestore connection.
          Check that <code className="font-mono">VITE_FIREBASE_*</code> environment variables
          are set in <code className="font-mono">.env.production</code> and the app was rebuilt.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Overview ───────────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-medium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Firestore Data Manager
              </CardTitle>
              <CardDescription className="mt-1">
                Seed Firestore from the canonical local data files. Duplicate detection
                prevents double-inserting existing records.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={refreshCounts} disabled={countsLoading} title="Refresh counts">
              <RefreshCw className={`h-4 w-4 ${countsLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Collection count grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {COLS.map(col => {
              const live = counts[col.collectionName] ?? "…";
              const full = typeof live === "number" && live >= col.seedCount;
              return (
                <div key={col.key} className={`rounded-xl p-3 text-center ${COLOR_MAP[col.color]}`}>
                  <div className="text-xl font-bold">{countsLoading ? "…" : live}</div>
                  <div className="text-xs font-medium opacity-80">{col.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">seed: {col.seedCount}</div>
                  {full && <div className="text-[10px] mt-0.5 font-medium">✓ seeded</div>}
                </div>
              );
            })}
            {/* Total */}
            <div className="rounded-xl p-3 text-center bg-muted/40">
              <div className="text-xl font-bold">{countsLoading ? "…" : totalLive}</div>
              <div className="text-xs font-medium opacity-80">Total Docs</div>
              <div className="text-[10px] opacity-60 mt-0.5">seed: {totalSeed}</div>
            </div>
          </div>

          {/* Info banner */}
          <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm">
              <strong>Seed All</strong> adds missing records (skips duplicates by title/name).{" "}
              <strong>Clear &amp; Reseed</strong> deletes all docs in every collection first.{" "}
              Per-collection buttons below let you target individual collections.
            </AlertDescription>
          </Alert>

          {/* Global actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSeedAll}
              disabled={isUploading}
              className="flex-1 shadow-glow"
            >
              {isUploading && activeCol === "All Collections"
                ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                : <Upload className="w-4 h-4 mr-2" />
              }
              Seed All (skip duplicates)
            </Button>
            <Button
              onClick={handleClearAll}
              disabled={isUploading}
              variant="destructive"
              className="flex-1"
            >
              {isUploading && activeCol?.includes("Clear")
                ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                : <Trash2 className="w-4 h-4 mr-2" />
              }
              Clear All &amp; Reseed
            </Button>
          </div>

          {/* Progress bar */}
          {isUploading && progress.length > 0 && (
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex justify-between text-sm font-medium">
                <span>{activeCol}</span>
                <span>{progress[0]?.current}/{progress[0]?.total}</span>
              </div>
              <Progress
                value={progress[0]?.total ? (progress[0].current / progress[0].total) * 100 : 0}
                className="h-2"
              />
              {(progress[0]?.skipped ?? 0) > 0 && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <SkipForward className="h-3 w-3" />
                  {progress[0].skipped} duplicate{(progress[0].skipped ?? 0) !== 1 ? "s" : ""} skipped
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>

      {/* ── Per-collection controls ─────────────────────────────────────────── */}
      <Card className="border-0 shadow-medium">
        <CardHeader>
          <CardTitle className="text-base">Per-Collection Seeding</CardTitle>
          <CardDescription>Seed or replace individual collections.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COLS.map(col => {
              const live = counts[col.collectionName] ?? 0;
              const isBusy = isUploading && activeCol === col.label;
              return (
                <div
                  key={col.key}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card/60 gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{col.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono">{col.collectionName}</span>
                      {" · "}
                      {countsLoading ? "…" : live} in DB / {col.seedCount} in seed
                    </div>
                    {typeof live === "number" && live > 0 && live < col.seedCount && (
                      <Badge variant="outline" className="mt-1 text-[10px] text-amber-600 border-amber-300">
                        <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                        partial
                      </Badge>
                    )}
                    {typeof live === "number" && live >= col.seedCount && live > 0 && (
                      <Badge variant="outline" className="mt-1 text-[10px] text-green-600 border-green-300">
                        <CheckCircle className="h-2.5 w-2.5 mr-1" />
                        seeded
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUploading}
                      onClick={() => handleSeedOne(col, false)}
                      title={`Add missing ${col.label} (skip duplicates)`}
                    >
                      {isBusy
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Upload className="h-3.5 w-3.5" />
                      }
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isUploading}
                      onClick={() => handleSeedOne(col, true)}
                      title={`Clear all ${col.label} and reseed`}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {results.length > 0 && (
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((r, i) => (
              <div key={i} className={`p-4 rounded-xl border ${r.errors > 0 ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20" : "border-green-300 bg-green-50/50 dark:bg-green-950/20"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize text-sm">{r.collection}</span>
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">✅ {r.success}</span>
                    <span className="text-blue-600">⏭ {r.skipped}</span>
                    <span className="text-red-600">❌ {r.errors}</span>
                  </div>
                </div>
                {r.details.length > 0 && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-xs text-muted-foreground select-none">
                      View {r.details.length} detail lines
                    </summary>
                    <div className="mt-2 font-mono text-[11px] space-y-0.5 max-h-40 overflow-y-auto bg-black/5 dark:bg-white/5 p-2 rounded">
                      {r.details.map((d, j) => <div key={j}>{d}</div>)}
                    </div>
                  </details>
                )}
              </div>
            ))}

            {/* Summary row */}
            <div className="flex gap-4 text-sm pt-2 border-t border-border/50">
              <span className="text-green-600 font-medium">
                ✅ {results.reduce((s, r) => s + r.success, 0)} uploaded
              </span>
              <span className="text-blue-600 font-medium">
                ⏭ {results.reduce((s, r) => s + r.skipped, 0)} skipped
              </span>
              <span className="text-red-600 font-medium">
                ❌ {results.reduce((s, r) => s + r.errors, 0)} errors
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Upload Failed</div>
            <div className="text-sm mt-1 font-mono">{error}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Console tip ────────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Browser Console Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-xs bg-black/5 dark:bg-white/5 p-3 rounded-lg space-y-1">
            <div><span className="text-blue-500">seedPortfolio()</span>         <span className="text-muted-foreground">// seed all, skip duplicates</span></div>
            <div><span className="text-red-500">clearAndSeed()</span>           <span className="text-muted-foreground">// delete all + reseed</span></div>
            <div><span className="text-green-500">seedProjects()</span>         <span className="text-muted-foreground">// projects only</span></div>
            <div><span className="text-green-500">seedSkills()</span>           <span className="text-muted-foreground">// skills only</span></div>
            <div><span className="text-green-500">seedExperience()</span>       <span className="text-muted-foreground">// experience only</span></div>
            <div><span className="text-green-500">seedUpcoming()</span>         <span className="text-muted-foreground">// upcoming projects only</span></div>
            <div><span className="text-green-500">seedTestimonials()</span>    <span className="text-muted-foreground">// testimonials only</span></div>
            <div><span className="text-green-500">seedLinks()</span>            <span className="text-muted-foreground">// links only</span></div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

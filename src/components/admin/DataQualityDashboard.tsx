/**
 * DataQualityDashboard – Admin tab
 * Runs the data-quality auditor against all live Firestore collections,
 * shows per-collection score, issue breakdown, and lets admins apply
 * auto-fixes with one click.
 */

import { useState, useCallback, useEffect } from "react";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/database-schema";
import type { ProjectSchema, ExperienceSchema, SkillSchema } from "@/lib/database-schema";
import {
  auditProjects, auditExperiences, auditSkills,
  autoFixProject, autoFixSkill,
  computeOverallHealth,
  type DataQualityReport, type DataQualityIssue,
} from "@/lib/data-quality";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle, CheckCircle, RefreshCw, Wrench,
  Database, Shield, FileText, Sparkles,
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useExperience } from "@/hooks/useExperience";
import { useSkills } from "@/hooks/useSkills";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-emerald-50 border-emerald-200";
  if (score >= 50) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function ScoreRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={r}
        fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill={color}>
        {score}
      </text>
    </svg>
  );
}

function IssueRow({
  issue, onFix,
}: {
  issue: DataQualityIssue;
  onFix?: (issue: DataQualityIssue) => void;
}) {
  return (
    <div className={`flex items-start justify-between gap-3 py-2 px-3 rounded-lg text-xs ${issue.severity === "error" ? "bg-red-50/60 border border-red-100" : "bg-amber-50/60 border border-amber-100"}`}>
      <div className="flex items-start gap-2 min-w-0">
        {issue.severity === "error" ? (
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        )}
        <div className="min-w-0">
          <span className="font-medium text-foreground">{issue.itemTitle}</span>
          <span className="text-muted-foreground"> · </span>
          <span className="font-mono text-muted-foreground">{issue.field}</span>
          <div className="text-muted-foreground mt-0.5">{issue.message}</div>
          {issue.suggestedFix && (
            <div className="text-muted-foreground/70 mt-0.5 italic">
              Suggestion: {issue.suggestedFix.slice(0, 80)}{issue.suggestedFix.length > 80 ? "…" : ""}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Badge variant="outline" className={`text-[10px] ${issue.severity === "error" ? "border-red-300 text-red-700" : "border-amber-300 text-amber-700"}`}>
          {issue.severity}
        </Badge>
        {issue.autoFixable && onFix && (
          <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => onFix(issue)}>
            <Wrench className="w-2.5 h-2.5 mr-1" />Fix
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Collection report card ───────────────────────────────────────────────────

function CollectionReport({
  report, onFixAll,
}: {
  report: DataQualityReport;
  onFixAll?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const autoFixable = report.issues.filter((i) => i.autoFixable).length;

  const collectionIcon: Record<string, React.ReactNode> = {
    projects: <FileText className="w-4 h-4" />,
    experiences: <Database className="w-4 h-4" />,
    skills: <Sparkles className="w-4 h-4" />,
  };

  return (
    <Card className={`border ${scoreBg(report.score)}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScoreRing score={report.score} />
            <div>
              <CardTitle className="text-base flex items-center gap-2 capitalize">
                {collectionIcon[report.collection]}
                {report.collection}
              </CardTitle>
              <div className="text-xs text-muted-foreground mt-0.5">
                {report.total} records · {report.withIssues} with issues
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {autoFixable > 0 && onFixAll && (
              <Button size="sm" variant="outline" onClick={onFixAll} className="text-xs gap-1">
                <Wrench className="w-3 h-3" />
                Fix {autoFixable} auto
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)} className="text-xs">
              {expanded ? "Hide" : "Show"} issues
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3 text-xs text-center">
          <div className="bg-white/60 rounded-lg py-2">
            <div className="text-lg font-bold text-red-600">{report.errorCount}</div>
            <div className="text-muted-foreground">Errors</div>
          </div>
          <div className="bg-white/60 rounded-lg py-2">
            <div className="text-lg font-bold text-amber-600">{report.warningCount}</div>
            <div className="text-muted-foreground">Warnings</div>
          </div>
          <div className="bg-white/60 rounded-lg py-2">
            <div className={`text-lg font-bold ${scoreColor(report.score)}`}>{report.score}</div>
            <div className="text-muted-foreground">Score</div>
          </div>
        </div>

        <Progress value={report.score} className="h-2" />

        {expanded && report.issues.length > 0 && (
          <div className="space-y-1.5 mt-3 max-h-72 overflow-y-auto pr-0.5">
            {report.issues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </div>
        )}

        {expanded && report.issues.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 py-2">
            <CheckCircle className="w-3.5 h-3.5" />
            No issues found – this collection is clean!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DataQualityDashboard() {
  const { projects } = useProjects();
  const { experiences } = useExperience();
  const { skills } = useSkills();

  const [reports, setReports] = useState<DataQualityReport[]>([]);
  const [running, setRunning] = useState(false);
  const [fixLog, setFixLog] = useState<string[]>([]);
  const [lastRun, setLastRun] = useState<number | null>(null);

  const runAudit = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const newReports = [
        auditProjects(projects as ProjectSchema[]),
        auditExperiences(experiences as ExperienceSchema[]),
        auditSkills(skills as SkillSchema[]),
      ];
      setReports(newReports);
      setLastRun(Date.now());
      setRunning(false);
    }, 300); // brief delay for UX
  }, [projects, experiences, skills]);

  // Auto-run on mount when data is loaded
  useEffect(() => {
    if (projects.length || experiences.length || skills.length) {
      runAudit();
    }
  }, [projects.length, experiences.length, skills.length]); // eslint-disable-line

  // ── Auto-fix handlers ──────────────────────────────────────────────────────

  const handleFixAllProjects = useCallback(async () => {
    if (!isFirebaseEnabled || !db) {
      setFixLog((l) => [...l, "Firebase not enabled – fixes not persisted."]);
      return;
    }
    const projectReport = reports.find((r) => r.collection === "projects");
    if (!projectReport) return;

    const autoFixableIssues = projectReport.issues.filter((i) => i.autoFixable);
    const affectedIds = [...new Set(autoFixableIssues.map((i) => i.itemId))];

    let fixed = 0;
    for (const id of affectedIds) {
      const project = projects.find((p) => p.id === id) as ProjectSchema | undefined;
      if (!project) continue;
      const patched = autoFixProject(project, autoFixableIssues);
      // Only update changed fields
      const { id: _, ...updateData } = patched;
      try {
        await updateDoc(doc(db, COLLECTIONS.PROJECTS, id), updateData as Record<string, unknown>);
        fixed++;
        setFixLog((l) => [...l, `✓ Fixed project: ${project.title}`]);
      } catch (err) {
        setFixLog((l) => [...l, `✗ Error fixing ${project.title}: ${String(err)}`]);
      }
    }
    setFixLog((l) => [...l, `Auto-fix complete: ${fixed} projects updated.`]);
    runAudit();
  }, [reports, projects, runAudit]);

  const handleFixAllSkills = useCallback(async () => {
    if (!isFirebaseEnabled || !db) {
      setFixLog((l) => [...l, "Firebase not enabled – fixes not persisted."]);
      return;
    }
    const skillReport = reports.find((r) => r.collection === "skills");
    if (!skillReport) return;

    const autoFixableIssues = skillReport.issues.filter((i) => i.autoFixable);
    const affectedIds = [...new Set(autoFixableIssues.map((i) => i.itemId))];

    let fixed = 0;
    for (const id of affectedIds) {
      const skill = skills.find((s) => s.id === id) as SkillSchema | undefined;
      if (!skill) continue;
      const patched = autoFixSkill(skill, autoFixableIssues);
      const { id: _, ...updateData } = patched;
      try {
        await updateDoc(doc(db, COLLECTIONS.SKILLS, id), updateData as Record<string, unknown>);
        fixed++;
        setFixLog((l) => [...l, `✓ Fixed skill: ${skill.name}`]);
      } catch (err) {
        setFixLog((l) => [...l, `✗ Error fixing ${skill.name}: ${String(err)}`]);
      }
    }
    setFixLog((l) => [...l, `Auto-fix complete: ${fixed} skills updated.`]);
    runAudit();
  }, [reports, skills, runAudit]);

  const overallScore = reports.length ? computeOverallHealth(reports) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Data Quality Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Validates all Firestore collections against Zod schemas · auto-fix available
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRun && (
            <span className="text-xs text-muted-foreground">
              Last run: {new Date(lastRun).toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={runAudit} disabled={running}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${running ? "animate-spin" : ""}`} />
            {running ? "Auditing…" : "Run Audit"}
          </Button>
        </div>
      </div>

      {/* Overall score */}
      {overallScore !== null && (
        <Card className={`border-2 ${scoreBg(overallScore)}`}>
          <CardContent className="py-4 flex items-center gap-5">
            <ScoreRing score={overallScore} />
            <div>
              <div className={`text-2xl font-bold ${scoreColor(overallScore)}`}>
                Overall Data Health: {overallScore}/100
              </div>
              <div className="text-sm text-muted-foreground">
                {overallScore >= 80
                  ? "Your data is clean and well-structured. Keep it up!"
                  : overallScore >= 50
                  ? "Some records have issues – review warnings and errors below."
                  : "Critical issues found. Fix errors to improve data quality."}
              </div>
              <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                <span>{reports.reduce((s, r) => s + r.total, 0)} total records</span>
                <span>{reports.reduce((s, r) => s + r.errorCount, 0)} errors</span>
                <span>{reports.reduce((s, r) => s + r.warningCount, 0)} warnings</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No data state */}
      {reports.length === 0 && !running && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Database className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>Click <strong>Run Audit</strong> to validate your data.</p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {running && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-60" />
            <p>Running audit across {projects.length + experiences.length + skills.length} records…</p>
          </CardContent>
        </Card>
      )}

      {/* Per-collection reports */}
      {!running && reports.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {reports.map((r) => (
            <CollectionReport
              key={r.collection}
              report={r}
              onFixAll={
                r.collection === "projects"
                  ? handleFixAllProjects
                  : r.collection === "skills"
                  ? handleFixAllSkills
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Fix activity log */}
      {fixLog.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-500" />
              Auto-Fix Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-xs space-y-0.5 max-h-48 overflow-y-auto bg-muted/30 rounded-lg p-3">
              {fixLog.map((line, i) => (
                <div key={i} className={line.startsWith("✓") ? "text-emerald-700" : line.startsWith("✗") ? "text-red-600" : "text-muted-foreground"}>
                  {line}
                </div>
              ))}
            </div>
            <Button
              size="sm" variant="ghost"
              className="mt-2 text-xs text-muted-foreground"
              onClick={() => setFixLog([])}
            >
              Clear log
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Validation rules summary */}
      <Card className="bg-muted/20 border-dashed">
        <CardContent className="pt-4 pb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Active Zod validation rules
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {[
              {
                title: "Projects",
                rules: [
                  "title ≥ 3 chars, ≤ 200",
                  "description ≥ 10 chars",
                  "technologies non-empty",
                  "slug lowercase + hyphens",
                  "metaDescription ≤ 160 chars",
                  "priority 0–100",
                  "valid category enum",
                  "valid status enum",
                ],
              },
              {
                title: "Experiences",
                rules: [
                  "title ≥ 2 chars",
                  "company name required",
                  "startDate in YYYY-MM format",
                  "type is valid enum",
                  "≥ 1 achievement required",
                  "current flag present",
                  "priority 0–100",
                ],
              },
              {
                title: "Skills",
                rules: [
                  "name required",
                  "valid category enum",
                  "level 1–100 integer",
                  "yearsOfExperience ≥ 0",
                  "color is hex (#RRGGBB)",
                  "priority 0–100",
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <div className="font-semibold mb-1.5 capitalize">{col.title}</div>
                <ul className="space-y-0.5">
                  {col.rules.map((r) => (
                    <li key={r} className="flex items-start gap-1.5 text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

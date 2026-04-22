/**
 * AnalyticsDashboard – Admin panel section showing:
 *   • KPI cards: page views, project views, CV downloads, contact forms, link clicks
 *   • Top-5 most viewed projects bar chart (pure CSS)
 *   • Recent events feed with type badges and timestamps
 *   • Firebase disabled / no-data graceful states
 */

import { useAnalyticsSummary } from "@/hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isFirebaseEnabled } from "@/lib/firebase";
import {
  Activity,
  BarChart2,
  Download,
  Eye,
  Mail,
  MousePointerClick,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

const EVENT_META: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  page_view: {
    label: "Page View",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: <Eye className="h-3 w-3" />,
  },
  project_view: {
    label: "Project View",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    icon: <TrendingUp className="h-3 w-3" />,
  },
  cv_download: {
    label: "CV Download",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: <Download className="h-3 w-3" />,
  },
  contact_form: {
    label: "Contact Form",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    icon: <Mail className="h-3 w-3" />,
  },
  link_click: {
    label: "Link Click",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    icon: <MousePointerClick className="h-3 w-3" />,
  },
};

function KpiCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <Card className="border-0 shadow-medium">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
          <div>
            <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const {
    totalPageViews,
    totalProjectViews,
    totalCVDownloads,
    totalContactForms,
    totalLinkClicks,
    recentEvents,
    topProjects,
    loading,
    error,
  } = useAnalyticsSummary();

  if (!isFirebaseEnabled) {
    return (
      <Card className="border-0 shadow-medium">
        <CardContent className="py-16 text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground font-medium">
            Analytics requires Firebase to be enabled.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Configure your Firebase environment variables to start tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <RefreshCw className="h-8 w-8 mx-auto animate-spin mb-3 opacity-50" />
        Loading analytics…
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-medium">
        <CardContent className="py-8 text-center">
          <p className="text-red-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const total =
    totalPageViews +
    totalProjectViews +
    totalCVDownloads +
    totalContactForms +
    totalLinkClicks;

  if (total === 0) {
    return (
      <Card className="border-0 shadow-medium">
        <CardContent className="py-16 text-center">
          <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground font-medium">
            No analytics data yet.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Events will appear here as visitors interact with your portfolio.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxViews = topProjects[0]?.views ?? 1;

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          icon={<Eye className="h-5 w-5 text-blue-600" />}
          bg="bg-blue-500/10"
          label="Page Views"
          value={totalPageViews}
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          bg="bg-purple-500/10"
          label="Project Views"
          value={totalProjectViews}
        />
        <KpiCard
          icon={<Download className="h-5 w-5 text-green-600" />}
          bg="bg-green-500/10"
          label="CV Downloads"
          value={totalCVDownloads}
        />
        <KpiCard
          icon={<Mail className="h-5 w-5 text-orange-600" />}
          bg="bg-orange-500/10"
          label="Contact Forms"
          value={totalContactForms}
        />
        <KpiCard
          icon={<MousePointerClick className="h-5 w-5 text-pink-600" />}
          bg="bg-pink-500/10"
          label="Link Clicks"
          value={totalLinkClicks}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Projects */}
        {topProjects.length > 0 && (
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart2 className="h-4 w-4" />
                Top Viewed Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topProjects.map(({ projectId, views }, idx) => (
                <div key={projectId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[200px]">
                      #{idx + 1} {projectId}
                    </span>
                    <span className="text-muted-foreground text-xs ml-2">
                      {views} views
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(views / maxViews) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Events */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Recent Events
              <Badge variant="outline" className="ml-auto">
                Last {recentEvents.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {recentEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No recent events
                </p>
              ) : (
                recentEvents.map((ev) => {
                  const meta = EVENT_META[ev.type] ?? {
                    label: ev.type,
                    color: "bg-muted",
                    icon: <Activity className="h-3 w-3" />,
                  };
                  return (
                    <div
                      key={ev.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      <Badge className={`text-xs shrink-0 gap-1 ${meta.color}`}>
                        {meta.icon}
                        {meta.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground truncate flex-1">
                        {String(ev.metadata?.page ?? "")}
                      </span>
                      <span className="text-xs text-muted-foreground/60 shrink-0">
                        {new Date(ev.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

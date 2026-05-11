import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Plus, Database, Upload, Link, Clock,
  ExternalLink, TrendingUp, Settings, Star, Eye, Mail,
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useContactMessages } from "@/hooks/useContactMessages";
import { useMemo } from "react";

interface OverviewTabProps {
  onNavigate: (tab: string) => void;
}

export function OverviewTab({ onNavigate }: OverviewTabProps) {
  const { projects } = useProjects();
  const { messages, unreadCount } = useContactMessages();

  const stats = useMemo(() => ({
    total: projects.length,
    featured: projects.filter((p) => p.featured).length,
    active: projects.filter((p) => !p.disabled).length,
    categories: [...new Set(projects.map((p) => p.category))].length,
  }), [projects]);

  const statCards = [
    { label: "Total Projects", value: stats.total, icon: Database, color: "bg-primary/10 text-primary" },
    { label: "Featured", value: stats.featured, icon: Star, color: "bg-yellow-500/10 text-yellow-500" },
    { label: "Active", value: stats.active, icon: Eye, color: "bg-green-500/10 text-green-500" },
    { label: "Categories", value: stats.categories, icon: BarChart3, color: "bg-blue-500/10 text-blue-500" },
    { label: "Messages", value: messages.length, icon: Mail, color: "bg-purple-500/10 text-purple-500", badge: unreadCount > 0 ? unreadCount : undefined },
  ];

  const quickActions = [
    { label: "Upload Portfolio Data", icon: Upload, tab: "upload" },
    { label: "Add New Project", icon: Plus, tab: "add-project" },
    { label: "Manage Projects", icon: Database, tab: "projects" },
    { label: "Manage Experience", icon: TrendingUp, tab: "experience" },
    { label: "Manage Skills", icon: BarChart3, tab: "skills" },
    { label: "Manage Links", icon: Link, tab: "links" },
    { label: "Upcoming Projects", icon: Clock, tab: "upcoming" },
    { label: "Site Settings", icon: Settings, tab: "settings" },
    ...(unreadCount > 0 ? [{ label: `Messages (${unreadCount} unread)`, icon: Mail, tab: "messages" }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, badge }) => (
          <Card key={label} className="border-0 shadow-medium">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="text-2xl font-bold">{value}</div>
                    {badge !== undefined && (
                      <Badge className="bg-red-500 text-white text-[10px] h-4 px-1.5">{badge}</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects.slice(0, 6).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{project.title}</div>
                    <div className="text-xs text-muted-foreground">{project.category}</div>
                  </div>
                  <Badge variant={project.featured ? "default" : "outline"} className="text-xs shrink-0">
                    {project.featured ? "Featured" : "Standard"}
                  </Badge>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No projects yet — upload data or add your first project
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map(({ label, icon: Icon, tab }) => (
              <Button
                key={tab}
                onClick={() => onNavigate(tab)}
                className="w-full justify-start h-9"
                variant="outline"
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
            <Button
              onClick={() => window.open("/", "_blank")}
              className="w-full justify-start h-9"
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Live Site
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

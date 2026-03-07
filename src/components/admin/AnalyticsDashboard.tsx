import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProjects } from '@/hooks/useProjects';
import { useSkills } from '@/hooks/useSkills';
import { useUserTracking } from '@/hooks/useUserTracking';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import {
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  Monitor,
  Database,
  Award,
  Activity,
  Clock,
  Globe,
  Smartphone,
  Laptop,
  Eye,
  MousePointer,
  Zap,
  Target,
  Thermometer,
  TestTube,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
} from 'lucide-react';

interface AnalyticsMetric {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

interface VisitorData {
  id: string;
  timestamp: number;
  page: string;
  userAgent: string;
  location?: string;
  sessionDuration: number;
  interactions: number;
  referrer?: string;
}

interface HeatmapData {
  x: number;
  y: number;
  intensity: number;
  element: string;
  count: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
}

interface ABTestVariant {
  id: string;
  name: string;
  traffic: number;
  conversions: number;
  conversionRate: number;
  isActive: boolean;
}

export function AnalyticsDashboard() {
  const { projects, loading: projectsLoading } = useProjects();
  const { skills, loading: skillsLoading } = useSkills();
  const { events, getEventStats, isTracking, setIsTracking } =
    useUserTracking();
  const {
    metrics: performanceMetrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  } = usePerformanceMonitoring();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [heatmapEnabled, setHeatmapEnabled] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [abTestingEnabled, setAbTestingEnabled] = useState<boolean>(false);

  // Mock analytics data - replace with real analytics service
  const analytics = useMemo(
    () => ({
      visitors: {
        total: 1245,
        unique: 892,
        returning: 353,
        bounceRate: 34.5,
        avgSessionDuration: 245000, // in milliseconds
        pageViews: 2891,
        newVisitors: 539,
      },
      devices: {
        desktop: 65,
        mobile: 28,
        tablet: 7,
      },
      pages: {
        mostVisited: [
          { path: '/', views: 1245, bounceRate: 25.4 },
          { path: '/projects', views: 892, bounceRate: 15.2 },
          { path: '/about', views: 567, bounceRate: 32.1 },
          { path: '/contact', views: 234, bounceRate: 45.8 },
        ],
      },
      performance: {
        loadTime: 1.2,
        lighthouse: 95,
        coreWebVitals: {
          lcp: 1.8,
          fid: 45,
          cls: 0.05,
        },
      },
    }),
    []
  );

  // Generate visitor data
  const visitorData: VisitorData[] = useMemo(() => {
    const data = [];
    const now = Date.now();
    for (let i = 0; i < 50; i++) {
      data.push({
        id: `visitor-${i}`,
        timestamp: now - Math.random() * 86400000 * 7, // Last 7 days
        page: ['/', '/projects', '/about', '/contact'][
          Math.floor(Math.random() * 4)
        ],
        userAgent: ['Chrome', 'Firefox', 'Safari', 'Edge'][
          Math.floor(Math.random() * 4)
        ],
        location: ['US', 'UK', 'DE', 'FR', 'CA'][Math.floor(Math.random() * 5)],
        sessionDuration: Math.random() * 300000 + 30000,
        interactions: Math.floor(Math.random() * 20) + 1,
        referrer: Math.random() > 0.5 ? 'google.com' : 'direct',
      });
    }
    return data.sort((a, b) => b.timestamp - a.timestamp);
  }, []);

  // Generate heatmap data
  const heatmapData: HeatmapData[] = useMemo(() => {
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        intensity: Math.random(),
        element: ['button', 'link', 'image', 'text'][
          Math.floor(Math.random() * 4)
        ],
        count: Math.floor(Math.random() * 50) + 1,
      });
    }
    return data;
  }, []);

  // A/B Test variants
  const abTestVariants: ABTestVariant[] = useMemo(
    () => [
      {
        id: 'variant-a',
        name: 'Original Hero',
        traffic: 50,
        conversions: 45,
        conversionRate: 4.5,
        isActive: true,
      },
      {
        id: 'variant-b',
        name: 'New Hero Design',
        traffic: 50,
        conversions: 52,
        conversionRate: 5.2,
        isActive: true,
      },
    ],
    []
  );

  const eventStats = getEventStats();

  // Analytics metrics
  const metrics: AnalyticsMetric[] = useMemo(
    () => [
      {
        title: 'Total Visitors',
        value: analytics.visitors.total.toLocaleString(),
        change: 12.5,
        icon: <Users className="h-5 w-5" />,
        color: 'text-blue-600',
        description: 'Unique visitors this period',
      },
      {
        title: 'Page Views',
        value: analytics.visitors.pageViews.toLocaleString(),
        change: 8.3,
        icon: <Eye className="h-5 w-5" />,
        color: 'text-green-600',
        description: 'Total page views',
      },
      {
        title: 'User Interactions',
        value: eventStats?.totalEvents || 0,
        change: 15.7,
        icon: <MousePointer className="h-5 w-5" />,
        color: 'text-purple-600',
        description: 'Click and interaction events',
      },
      {
        title: 'Performance Score',
        value: analytics.performance.lighthouse,
        change: 2.1,
        icon: <Zap className="h-5 w-5" />,
        color: 'text-orange-600',
        description: 'Lighthouse performance score',
      },
      {
        title: 'Bounce Rate',
        value: `${analytics.visitors.bounceRate}%`,
        change: -3.2,
        icon: <Target className="h-5 w-5" />,
        color: 'text-red-600',
        description: 'Percentage of single-page sessions',
      },
      {
        title: 'Avg Session',
        value: `${Math.round(analytics.visitors.avgSessionDuration / 1000)}s`,
        change: 5.8,
        icon: <Clock className="h-5 w-5" />,
        color: 'text-indigo-600',
        description: 'Average session duration',
      },
      {
        title: 'Projects Views',
        value: projects?.length || 0,
        change: 0,
        icon: <Database className="h-5 w-5" />,
        color: 'text-cyan-600',
        description: 'Total projects displayed',
      },
      {
        title: 'Skills Count',
        value: skills?.length || 0,
        change: 0,
        icon: <Award className="h-5 w-5" />,
        color: 'text-yellow-600',
        description: 'Total skills showcased',
      },
    ],
    [analytics, eventStats, projects, skills]
  );

  const performanceData: PerformanceMetric[] = useMemo(
    () => [
      {
        name: 'Largest Contentful Paint',
        value: analytics.performance.coreWebVitals.lcp,
        unit: 's',
        threshold: 2.5,
        status:
          analytics.performance.coreWebVitals.lcp <= 2.5 ? 'good' : 'warning',
      },
      {
        name: 'First Input Delay',
        value: analytics.performance.coreWebVitals.fid,
        unit: 'ms',
        threshold: 100,
        status:
          analytics.performance.coreWebVitals.fid <= 100 ? 'good' : 'warning',
      },
      {
        name: 'Cumulative Layout Shift',
        value: analytics.performance.coreWebVitals.cls,
        unit: '',
        threshold: 0.1,
        status:
          analytics.performance.coreWebVitals.cls <= 0.1 ? 'good' : 'warning',
      },
    ],
    [analytics]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitor portfolio performance and user engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isTracking ? 'destructive' : 'default'}
            size="sm"
            onClick={() => setIsTracking(!isTracking)}
            className="gap-2"
          >
            {isTracking ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isTracking ? 'Stop' : 'Start'} Tracking
          </Button>
          <Button
            variant={isMonitoring ? 'destructive' : 'outline'}
            size="sm"
            onClick={() =>
              isMonitoring ? stopMonitoring() : startMonitoring()
            }
            className="gap-2"
          >
            <Monitor className="h-4 w-4" />
            {isMonitoring ? 'Stop' : 'Start'} Monitoring
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card
            key={index}
            className="border-0 shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    {metric.change !== undefined && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        {metric.change > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(metric.change)}%
                      </Badge>
                    )}
                  </div>
                  {metric.description && (
                    <p className="text-xs text-muted-foreground">
                      {metric.description}
                    </p>
                  )}
                </div>
                <div className={`rounded-xl bg-muted/50 p-3 ${metric.color}`}>
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

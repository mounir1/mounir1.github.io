import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Zap,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
} from 'lucide-react';
import { useRUM } from '@/components/RUMProvider';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'needs-improvement' | 'poor';
  threshold: { good: number; poor: number };
  description: string;
}

interface BundleInfo {
  name: string;
  size: number;
  gzipped: number;
  status: 'good' | 'warning' | 'error';
}

const PerformanceDashboard: React.FC = () => {
  const { getPerformanceData } = useRUM();
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [bundleData, setBundleData] = useState<BundleInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const coreWebVitals: PerformanceMetric[] = [
    {
      name: 'Largest Contentful Paint',
      value: performanceData?.metrics?.LCP || 0,
      unit: 'ms',
      status: getMetricStatus(performanceData?.metrics?.LCP || 0, {
        good: 2500,
        poor: 4000,
      }),
      threshold: { good: 2500, poor: 4000 },
      description: 'Time until the largest content element is rendered',
    },
    {
      name: 'First Input Delay',
      value: performanceData?.metrics?.FID || 0,
      unit: 'ms',
      status: getMetricStatus(performanceData?.metrics?.FID || 0, {
        good: 100,
        poor: 300,
      }),
      threshold: { good: 100, poor: 300 },
      description: 'Time from first user interaction to browser response',
    },
    {
      name: 'Cumulative Layout Shift',
      value: performanceData?.metrics?.CLS || 0,
      unit: '',
      status: getMetricStatus(performanceData?.metrics?.CLS || 0, {
        good: 0.1,
        poor: 0.25,
      }),
      threshold: { good: 0.1, poor: 0.25 },
      description: 'Visual stability of the page during loading',
    },
    {
      name: 'First Contentful Paint',
      value: performanceData?.metrics?.FCP || 0,
      unit: 'ms',
      status: getMetricStatus(performanceData?.metrics?.FCP || 0, {
        good: 1800,
        poor: 3000,
      }),
      threshold: { good: 1800, poor: 3000 },
      description: 'Time until first content is painted',
    },
  ];

  function getMetricStatus(
    value: number,
    threshold: { good: number; poor: number }
  ): 'good' | 'needs-improvement' | 'poor' {
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Get current RUM data
      const rumData = getPerformanceData();
      setPerformanceData(rumData);

      // Load bundle analysis data from localStorage or API
      const bundleReport = localStorage.getItem('bundle-report');
      if (bundleReport) {
        const data = JSON.parse(bundleReport);
        const bundles: BundleInfo[] = Object.entries(data.bundles || {}).map(
          ([name, bundle]: [string, any]) => ({
            name,
            size: bundle.size,
            gzipped: bundle.gzipped,
            status:
              bundle.gzipped > 100000
                ? 'error'
                : bundle.gzipped > 50000
                  ? 'warning'
                  : 'good',
          })
        );
        setBundleData(bundles);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const exportData = () => {
    const data = {
      performanceData,
      bundleData,
      coreWebVitals,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'needs-improvement':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'poor':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'needs-improvement':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatMetricValue = (metric: PerformanceMetric) => {
    if (metric.name === 'Cumulative Layout Shift') {
      return metric.value.toFixed(3);
    }
    return Math.round(metric.value).toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Performance Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitor Core Web Vitals, bundle sizes, and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {lastUpdated && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            Last updated: {lastUpdated.toLocaleString()}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="bundles">Bundle Analysis</TabsTrigger>
          <TabsTrigger value="metrics">Custom Metrics</TabsTrigger>
          <TabsTrigger value="errors">Error Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {coreWebVitals.map(metric => (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.name}
                  </CardTitle>
                  {getStatusIcon(metric.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetricValue(metric)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {metric.unit}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                  <div className="mt-2">
                    <Progress
                      value={Math.min(
                        (metric.value / metric.threshold.poor) * 100,
                        100
                      )}
                      className="h-1"
                    />
                    <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                      <span>
                        Good: &lt;{metric.threshold.good}
                        {metric.unit}
                      </span>
                      <span>
                        Poor: &gt;{metric.threshold.poor}
                        {metric.unit}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bundles" className="space-y-4">
          <div className="grid gap-4">
            {bundleData.length > 0 ? (
              bundleData.map(bundle => (
                <Card key={bundle.name}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {bundle.name}
                    </CardTitle>
                    {getStatusIcon(bundle.status)}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">
                          {formatBytes(bundle.gzipped)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatBytes(bundle.size)} uncompressed
                        </div>
                      </div>
                      <Badge className={getStatusColor(bundle.status)}>
                        {bundle.status}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={Math.min((bundle.gzipped / 500000) * 100, 100)}
                        className="h-1"
                      />
                      <div className="mt-1 text-xs text-muted-foreground">
                        Compression ratio:{' '}
                        {((1 - bundle.gzipped / bundle.size) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    No bundle data available. Run bundle analysis to see
                    results.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {performanceData?.customMetrics &&
              Object.entries(performanceData.customMetrics).map(
                ([key, value]: [string, any]) => (
                  <Card key={key}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {typeof value === 'object'
                          ? JSON.stringify(value)
                          : value.toString()}
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="space-y-4">
            {performanceData?.errors && performanceData.errors.length > 0 ? (
              performanceData.errors.map((error: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Error #{index + 1}
                    </CardTitle>
                    <CardDescription>
                      {new Date(error.timestamp).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <strong>Message:</strong> {error.message}
                      </div>
                      {error.stack && (
                        <div>
                          <strong>Stack:</strong>
                          <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-2 text-center text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    No errors detected
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;

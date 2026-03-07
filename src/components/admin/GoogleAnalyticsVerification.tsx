import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  BarChart3,
  Code,
  Eye,
  RefreshCw,
  TestTube,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export const GoogleAnalyticsVerification: React.FC = () => {
  const [checks, setChecks] = useState<AnalyticsCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runAnalyticsChecks = async () => {
    setIsRunning(true);
    const results: AnalyticsCheck[] = [];

    // Check 1: Google Analytics script presence
    const gaScript = document.querySelector(
      'script[src*="googletagmanager.com/gtag/js"]'
    );
    results.push({
      name: 'Google Analytics Script',
      status: gaScript ? 'pass' : 'fail',
      message: gaScript ? 'GA script is loaded' : 'GA script not found',
      details: gaScript
        ? 'Script loaded from googletagmanager.com'
        : 'Check index.html for gtag script',
    });

    // Check 2: gtag function availability
    const gtagAvailable = typeof (window as any).gtag === 'function';
    results.push({
      name: 'gtag Function',
      status: gtagAvailable ? 'pass' : 'fail',
      message: gtagAvailable
        ? 'gtag function is available'
        : 'gtag function not found',
      details: gtagAvailable
        ? 'Ready to send events'
        : 'GA initialization may have failed',
    });

    // Check 3: Measurement ID configuration
    const measurementId = 'G-96R4Z44Y80';
    const configScript = document.querySelector('script');
    const hasConfig =
      document.documentElement.innerHTML.includes(measurementId);
    results.push({
      name: 'Measurement ID Configuration',
      status: hasConfig ? 'pass' : 'fail',
      message: hasConfig
        ? `${measurementId} is configured`
        : 'Measurement ID not found',
      details: hasConfig
        ? 'Correct measurement ID is present'
        : 'Check gtag config in index.html',
    });

    // Check 4: DataLayer presence
    const dataLayerExists = Array.isArray((window as any).dataLayer);
    results.push({
      name: 'DataLayer',
      status: dataLayerExists ? 'pass' : 'warning',
      message: dataLayerExists
        ? 'DataLayer is available'
        : 'DataLayer not found',
      details: dataLayerExists
        ? 'Ready for custom events'
        : 'Basic tracking may still work',
    });

    // Check 5: Network connectivity to GA
    try {
      const response = await fetch(
        'https://www.google-analytics.com/analytics.js',
        { method: 'HEAD' }
      );
      results.push({
        name: 'GA Network Connectivity',
        status: response.ok ? 'pass' : 'warning',
        message: response.ok
          ? 'Can reach Google Analytics'
          : 'Network issues detected',
        details: response.ok
          ? 'Analytics can send data'
          : 'Check network connection',
      });
    } catch (error) {
      results.push({
        name: 'GA Network Connectivity',
        status: 'fail',
        message: 'Cannot reach Google Analytics',
        details: 'Check internet connection and firewall settings',
      });
    }

    // Check 6: Error tracking setup
    const hasErrorTracking = document.documentElement.innerHTML.includes(
      "gtag('event', 'exception'"
    );
    results.push({
      name: 'Error Tracking',
      status: hasErrorTracking ? 'pass' : 'warning',
      message: hasErrorTracking
        ? 'Error tracking is configured'
        : 'Error tracking not detected',
      details: hasErrorTracking
        ? 'Errors will be reported to GA'
        : 'Consider adding error tracking',
    });

    // Check 7: Performance monitoring
    const hasPerformanceMonitoring =
      document.documentElement.innerHTML.includes('PerformanceMonitor');
    results.push({
      name: 'Performance Monitoring',
      status: hasPerformanceMonitoring ? 'pass' : 'warning',
      message: hasPerformanceMonitoring
        ? 'Performance monitoring active'
        : 'Performance monitoring not detected',
      details: hasPerformanceMonitoring
        ? 'Core Web Vitals tracked'
        : 'Enable for better insights',
    });

    setChecks(results);
    setLastRun(new Date());
    setIsRunning(false);
  };

  const sendTestEvent = () => {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'test_admin_panel', {
        event_category: 'admin',
        event_label: 'verification_test',
        value: 1,
      });

      // Show success message
      alert(
        'Test event sent to Google Analytics! Check your GA dashboard in a few minutes to see the event.'
      );
    } else {
      alert(
        'Google Analytics is not available. Please check the configuration.'
      );
    }
  };

  useEffect(() => {
    runAnalyticsChecks();
  }, []);

  const passedChecks = checks.filter(c => c.status === 'pass').length;
  const totalChecks = checks.length;
  const healthScore =
    totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'fail':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Verification</h2>
          <p className="text-muted-foreground">
            Test and verify Google Analytics configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={runAnalyticsChecks}
            disabled={isRunning}
          >
            <RefreshCw
              className={cn('mr-2 h-4 w-4', isRunning && 'animate-spin')}
            />
            {isRunning ? 'Running...' : 'Run Checks'}
          </Button>
          <Button onClick={sendTestEvent}>
            <TestTube className="mr-2 h-4 w-4" />
            Send Test Event
          </Button>
        </div>
      </div>

      {/* Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{healthScore}%</div>
            <div className="flex-1">
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className={cn(
                    'h-3 rounded-full transition-all duration-500',
                    healthScore >= 80
                      ? 'bg-green-500'
                      : healthScore >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  )}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {passedChecks} of {totalChecks} checks passed
                {lastRun && ` • Last run: ${lastRun.toLocaleTimeString()}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {checks.map((check, index) => (
            <div
              key={index}
              className={cn(
                'rounded-lg border p-4',
                getStatusColor(check.status)
              )}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{check.name}</h4>
                    <Badge
                      variant={
                        check.status === 'pass' ? 'default' : 'secondary'
                      }
                    >
                      {check.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm">{check.message}</p>
                  {check.details && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {check.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Button
          variant="outline"
          onClick={() =>
            window.open(
              'https://analytics.google.com/analytics/web/#/p10033401139',
              '_blank'
            )
          }
          className="justify-start gap-2"
        >
          <Eye className="h-4 w-4" />
          View Live Analytics
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            window.open(
              'https://developers.google.com/analytics/devguides/collection/ga4',
              '_blank'
            )
          }
          className="justify-start gap-2"
        >
          <Code className="h-4 w-4" />
          GA4 Documentation
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            window.open(
              'https://support.google.com/analytics/answer/9304153',
              '_blank'
            )
          }
          className="justify-start gap-2"
        >
          <Activity className="h-4 w-4" />
          Troubleshooting Guide
        </Button>
      </div>

      {/* Summary Alert */}
      {healthScore >= 80 ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Excellent! Your Google Analytics is properly configured and working
            well.
          </AlertDescription>
        </Alert>
      ) : healthScore >= 60 ? (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Good setup, but there are some areas for improvement. Check the
            warnings above.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Analytics configuration needs attention. Please review the failed
            checks above.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GoogleAnalyticsVerification;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart3,
  Globe,
  Eye,
  Copy,
  ExternalLink,
  CheckCircle,
  Info,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import GoogleAnalyticsVerification from './GoogleAnalyticsVerification';

interface GoogleAnalyticsInfoProps {
  className?: string;
}

export const GoogleAnalyticsInfo: React.FC<GoogleAnalyticsInfoProps> = ({
  className,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Google Analytics Stream Details
  const streamDetails = {
    streamName: 'MounirCvApp',
    streamUrl: 'https://mounir1.github.io',
    streamId: '10033401139',
    measurementId: 'G-96R4Z44Y80',
  };

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const openAnalytics = () => {
    window.open(
      `https://analytics.google.com/analytics/web/#/p${streamDetails.streamId}`,
      '_blank'
    );
  };

  const openWebsite = () => {
    window.open(streamDetails.streamUrl, '_blank');
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              Google Analytics Configuration
            </h2>
            <p className="text-muted-foreground">
              Stream details and analytics setup
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openWebsite} className="gap-2">
            <Globe className="h-4 w-4" />
            View Site
          </Button>
          <Button onClick={openAnalytics} className="gap-2">
            <Eye className="h-4 w-4" />
            Open Analytics
          </Button>
        </div>
      </div>

      {/* Analytics Status */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Google Analytics is properly configured and tracking your portfolio
          traffic.
        </AlertDescription>
      </Alert>

      {/* Stream Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Stream Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stream Name */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <div>
              <p className="font-medium">Stream Name</p>
              <p className="text-sm text-muted-foreground">
                The name of your Analytics data stream
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {streamDetails.streamName}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleCopy(streamDetails.streamName, 'streamName')
                }
                className="h-8 w-8 p-0"
              >
                {copiedField === 'streamName' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Stream URL */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <div>
              <p className="font-medium">Stream URL</p>
              <p className="text-sm text-muted-foreground">
                Your portfolio website URL
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {streamDetails.streamUrl}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(streamDetails.streamUrl, 'streamUrl')}
                className="h-8 w-8 p-0"
              >
                {copiedField === 'streamUrl' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={openWebsite}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stream ID */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <div>
              <p className="font-medium">Stream ID</p>
              <p className="text-sm text-muted-foreground">
                Unique identifier for your data stream
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {streamDetails.streamId}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(streamDetails.streamId, 'streamId')}
                className="h-8 w-8 p-0"
              >
                {copiedField === 'streamId' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Measurement ID */}
          <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div>
              <p className="font-medium">Measurement ID</p>
              <p className="text-sm text-muted-foreground">
                Google Analytics tracking code identifier
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 font-mono">
                {streamDetails.measurementId}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleCopy(streamDetails.measurementId, 'measurementId')
                }
                className="h-8 w-8 p-0"
              >
                {copiedField === 'measurementId' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Implementation Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Tracking Script</p>
                <p className="text-sm text-green-600">
                  Installed in index.html
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Error Tracking</p>
                <p className="text-sm text-green-600">Configured in main.tsx</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Performance Events</p>
                <p className="text-sm text-green-600">PerformanceMonitor.tsx</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">User Tracking</p>
                <p className="text-sm text-green-600">useUserTracking hook</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Button
              variant="outline"
              onClick={openAnalytics}
              className="justify-start gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics Dashboard
            </Button>

            <Button
              variant="outline"
              onClick={openWebsite}
              className="justify-start gap-2"
            >
              <Globe className="h-4 w-4" />
              Visit Portfolio Site
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                window.open('https://support.google.com/analytics', '_blank')
              }
              className="justify-start gap-2"
            >
              <Info className="h-4 w-4" />
              Analytics Help
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Verification */}
      <GoogleAnalyticsVerification />
    </div>
  );
};

export default GoogleAnalyticsInfo;

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  performanceMonitor,
  connectionMonitor,
  projectCache,
  skillCache,
} from '@/lib/performance';
import { Activity, Wifi, WifiOff, Database, Gauge } from 'lucide-react';

interface PerformanceStats {
  avg: number;
  min: number;
  max: number;
  count: number;
}

export function PerformanceMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<Record<string, PerformanceStats>>({});
  const [connectionQuality, setConnectionQuality] = useState<string>('good');
  const [cacheSize, setCacheSize] = useState(0);

  const updateStats = useCallback(() => {
    const allStats = performanceMonitor.getAllStats();
    setStats(allStats);
    setCacheSize(projectCache.size() + skillCache.size());
  }, []);

  useEffect(() => {
    const unsubscribe = connectionMonitor.onQualityChange(setConnectionQuality);
    setConnectionQuality(connectionMonitor.getQuality());
    return unsubscribe;
  }, []);

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [updateStats]);

  const getConnectionIcon = () => {
    return connectionQuality === 'poor' ? (
      <WifiOff className="h-4 w-4 text-red-500" />
    ) : (
      <Wifi className="h-4 w-4 text-green-500" />
    );
  };

  const formatMs = (ms: number) => {
    return ms < 1000 ? `${ms.toFixed(1)}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  const clearCaches = () => {
    projectCache.clear();
    skillCache.clear();
    updateStats();
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Activity className="mr-2 h-4 w-4" />
          Performance
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="border bg-background/95 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gauge className="h-5 w-5" />
              Performance
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <span className="text-sm">Connection</span>
            </div>
            <Badge
              variant={connectionQuality === 'poor' ? 'destructive' : 'default'}
            >
              {connectionQuality}
            </Badge>
          </div>

          {/* Cache Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm">Cache</span>
            </div>
            <span className="text-sm">{cacheSize} items</span>
          </div>

          {/* Performance Metrics */}
          {Object.keys(stats).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Timing Metrics</h4>
              {Object.entries(stats)
                .slice(0, 3)
                .map(([label, metric]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="truncate">{label}:</span>
                    <span>{formatMs(metric.avg)}</span>
                  </div>
                ))}
            </div>
          )}

          <div className="flex gap-2 border-t pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCaches}
              className="flex-1 text-xs"
            >
              Clear Cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performanceMonitor.clear()}
              className="flex-1 text-xs"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PerformanceMonitor;

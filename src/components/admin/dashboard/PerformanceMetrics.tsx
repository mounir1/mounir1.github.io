import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Gauge } from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

const metrics: PerformanceMetric[] = [
  {
    name: 'Page Load Time',
    value: 1.2,
    target: 1.5,
    unit: 's',
    trend: 'down',
    category: 'Performance',
  },
  {
    name: 'First Contentful Paint',
    value: 0.8,
    target: 1.0,
    unit: 's',
    trend: 'down',
    category: 'Performance',
  },
  {
    name: 'Time to Interactive',
    value: 2.1,
    target: 2.5,
    unit: 's',
    trend: 'down',
    category: 'Performance',
  },
  {
    name: 'Server Response Time',
    value: 0.3,
    target: 0.5,
    unit: 's',
    trend: 'stable',
    category: 'Server',
  },
];

const getTrendColor = (
  trend: PerformanceMetric['trend'],
  value: number,
  target: number
) => {
  if (trend === 'down') {
    return value <= target ? 'text-green-500' : 'text-red-500';
  }
  if (trend === 'up') {
    return value >= target ? 'text-green-500' : 'text-red-500';
  }
  return 'text-yellow-500';
};

const getProgressColor = (
  value: number,
  target: number,
  trend: PerformanceMetric['trend']
) => {
  if (trend === 'down') {
    return value <= target ? 'bg-green-500' : 'bg-red-500';
  }
  if (trend === 'up') {
    return value >= target ? 'bg-green-500' : 'bg-red-500';
  }
  return 'bg-yellow-500';
};

export const PerformanceMetrics: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = ({ className, ...props }) => {
  return (
    <Card className={className} {...props}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Performance Metrics
          </CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map(metric => {
            const progress =
              metric.trend === 'down'
                ? ((metric.target - metric.value) / metric.target) * 100
                : (metric.value / metric.target) * 100;

            return (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {metric.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-sm font-bold',
                          getTrendColor(
                            metric.trend,
                            metric.value,
                            metric.target
                          )
                        )}
                      >
                        {metric.value}
                        {metric.unit}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Target: {metric.target}
                        {metric.unit}
                      </span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={progress}
                  className="h-2"
                  indicatorClassName={cn(
                    getProgressColor(metric.value, metric.target, metric.trend),
                    'transition-all duration-300'
                  )}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

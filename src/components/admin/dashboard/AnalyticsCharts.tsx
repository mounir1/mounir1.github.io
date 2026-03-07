import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { cn } from '@/lib/utils';

const data = [
  { name: 'Jan', pageViews: 4000, uniqueVisitors: 2400, avgTime: 2.5 },
  { name: 'Feb', pageViews: 3000, uniqueVisitors: 1398, avgTime: 2.0 },
  { name: 'Mar', pageViews: 2000, uniqueVisitors: 9800, avgTime: 2.9 },
  { name: 'Apr', pageViews: 2780, uniqueVisitors: 3908, avgTime: 2.4 },
  { name: 'May', pageViews: 1890, uniqueVisitors: 4800, avgTime: 2.7 },
  { name: 'Jun', pageViews: 2390, uniqueVisitors: 3800, avgTime: 2.2 },
  { name: 'Jul', pageViews: 3490, uniqueVisitors: 4300, avgTime: 2.8 },
];

export const AnalyticsCharts: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = ({ className, ...props }) => {
  return (
    <div
      className={cn('grid grid-cols-1 gap-6 lg:grid-cols-2', className)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Visitor Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                  labelStyle={{
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pageViews"
                  stroke="hsl(var(--primary))"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="uniqueVisitors"
                  stroke="hsl(var(--secondary))"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Session Duration Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                  labelStyle={{
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avgTime"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary)/.2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { format } from 'date-fns';
import { Download, Loader2 } from 'lucide-react';
import { saveAs } from 'file-saver';

interface PerformanceMetric {
  id: number;
  name: string;
  value: number;
  date: string;
  status: 'good' | 'average' | 'poor';
}

interface PerformanceSummary {
  avgLoadTime: number;
  uptime: number;
  errorRate: number;
  apdexScore: number;
}

interface PerformanceData {
  total: number;
  summary: PerformanceSummary;
  metrics: PerformanceMetric[];
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';
const timeRangeOptions: { label: string; value: TimeRange }[] = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Last Year', value: '1y' },
  { label: 'All Time', value: 'all' },
];
const pageSizeOptions = [10, 25, 50, 100];

export const PerformanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>(
    'overview'
  );
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { data, isLoading, error, refetch } = usePerformanceMetrics({
    timeRange,
    searchQuery,
    page,
    pageSize,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    if (data) {
      setTotalPages(Math.ceil(data.total / pageSize));
      setTotalRecords(data.total);
    }
  }, [data, pageSize, page]);

  const handleExport = () => {
    if (!data) return;
    const csvContent = [
      ['Metric', 'Value', 'Date'],
      ...data.metrics.map((metric: PerformanceMetric) => [
        metric.name,
        metric.value.toString(),
        format(new Date(metric.date), 'yyyy-MM-dd'),
      ]),
    ]
      .map(e => e.join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `performance_metrics_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle className="text-2xl">Performance Dashboard</CardTitle>
            <CardDescription>
              Monitor and analyze your application's performance metrics.
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select
              value={timeRange}
              onValueChange={value => {
                setTimeRange(value as TimeRange);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Time Range" />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={!data || data.metrics.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={value =>
            setActiveTab(value as 'overview' | 'detailed')
          }
        >
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : error ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-red-500">
                  Error fetching performance metrics.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Avg. Load Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {data?.summary.avgLoadTime}ms
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Uptime</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {data?.summary.uptime}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Error Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {data?.summary.errorRate}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Apdex Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {data?.summary.apdexScore}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="detailed">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Input
                  placeholder="Search metrics..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Select
                  value={pageSize.toString()}
                  onValueChange={value => setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Page Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map(option => (
                      <SelectItem key={option} value={option.toString()}>
                        {option} per page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-red-500"
                      >
                        Error fetching performance metrics.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.metrics.map((metric: PerformanceMetric) => (
                      <TableRow key={metric.id}>
                        <TableCell>{metric.name}</TableCell>
                        <TableCell>{metric.value}</TableCell>
                        <TableCell>
                          {format(new Date(metric.date), 'yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              metric.status === 'good'
                                ? 'default'
                                : metric.status === 'average'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {metric.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PerformanceDashboard;

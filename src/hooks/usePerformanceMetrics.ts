import { useState, useEffect } from 'react';

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

interface UsePerformanceMetricsProps {
  timeRange: string;
  searchQuery: string;
  page: number;
  pageSize: number;
}

export const usePerformanceMetrics = ({
  timeRange,
  searchQuery,
  page,
  pageSize,
}: UsePerformanceMetricsProps) => {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockData = {
          total: 100,
          summary: {
            avgLoadTime: 120,
            uptime: 99.9,
            errorRate: 0.1,
            apdexScore: 0.9,
          },
          metrics: Array.from({ length: pageSize }, (_, i) => ({
            id: i + (page - 1) * pageSize,
            name: `Metric ${i + (page - 1) * pageSize}`,
            value: Math.random() * 100,
            date: new Date().toISOString(),
            status: ['good', 'average', 'poor'][
              Math.floor(Math.random() * 3)
            ] as 'good' | 'average' | 'poor',
          })),
        };

        setData(mockData);
      } catch (err) {
        setError(err as Error);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [timeRange, searchQuery, page, pageSize]);

  return { data, isLoading, error, refetch: () => {} };
};

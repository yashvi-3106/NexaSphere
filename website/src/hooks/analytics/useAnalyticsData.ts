import { useState, useEffect, useMemo } from 'react';
import { getApiBase } from '../../utils/runtimeConfig';
import apiClient from '../../utils/apiClient';
import { useAnalyticsFilters } from '../../context/AnalyticsFilterContext';
import {
  generateTrendData,
  generateDistributionData,
  generateComparisonData,
  TrendDataPoint,
  DistributionDataPoint,
  ComparisonDataPoint,
} from '../../utils/chartDataFormatters';

/**
 * Returns true when the API base URL is configured for this deployment.
 * Falls back to mock data when offline or unconfigured.
 */
const isApiConfigured = () => Boolean(getApiBase());

export const useAnalyticsData = () => {
  const { filters } = useAnalyticsFilters();
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [distributionData, setDistributionData] = useState<DistributionDataPoint[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonDataPoint[]>([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const months =
      (filters.dateRange.end.getFullYear() - filters.dateRange.start.getFullYear()) * 12 +
      (filters.dateRange.end.getMonth() - filters.dateRange.start.getMonth());
    const effectiveMonths = Math.max(1, months);

    const applyMockData = () => {
      if (!isMounted) return;
      setIsOffline(true);
      setTrendData(generateTrendData(filters.timeGranularity, effectiveMonths));
      setDistributionData(generateDistributionData(filters.categories));
      setComparisonData(generateComparisonData(filters.categories));
      setLoading(false);
    };

    if (!isApiConfigured()) {
      applyMockData();
      return () => {
        isMounted = false;
      };
    }

    const base = getApiBase();
    const token = localStorage.getItem('ns_student_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.allSettled([
      apiClient(`${base}/api/admin/analytics/stats`, { headers }),
      apiClient(`${base}/api/admin/analytics/growth`, { headers }),
      apiClient(`${base}/api/admin/analytics/events`, { headers }),
    ])
      .then(([statsResult, growthResult, eventsResult]) => {
        if (!isMounted) return;
        if (import.meta.env.DEV) {
          if (statsResult.status === 'rejected') {
            console.warn('[useAnalyticsData] Stats fetch failed:', statsResult.reason?.message);
          }
          if (growthResult.status === 'rejected') {
            console.warn('[useAnalyticsData] Growth fetch failed:', growthResult.reason?.message);
          }
          if (eventsResult.status === 'rejected') {
            console.warn('[useAnalyticsData] Events fetch failed:', eventsResult.reason?.message);
          }
        }
        if (
          statsResult.status === 'rejected' &&
          growthResult.status === 'rejected' &&
          eventsResult.status === 'rejected'
        ) {
          applyMockData();
          return;
        }
        setIsOffline(false);
        const growth = growthResult.status === 'fulfilled' ? growthResult.value : null;
        const events = eventsResult.status === 'fulfilled' ? eventsResult.value : null;

        // Map API responses to chart data shapes.
        // growth is expected to be an array of { name, users, activity, projects }
        if (Array.isArray(growth) && growth.length > 0) {
          setTrendData(growth as TrendDataPoint[]);
        } else {
          setTrendData(generateTrendData(filters.timeGranularity, effectiveMonths));
        }

        // events is expected to be an array of { name, value } category distribution
        if (Array.isArray(events) && events.length > 0) {
          setDistributionData(events as DistributionDataPoint[]);
          setComparisonData(generateComparisonData(filters.categories));
        } else {
          setDistributionData(generateDistributionData(filters.categories));
          setComparisonData(generateComparisonData(filters.categories));
        }

        setLoading(false);
      })
      .catch(() => {
        if (isMounted) applyMockData();
      });

    return () => {
      isMounted = false;
    };
  }, [filters]);

  const overviewMetrics = useMemo(() => {
    if (trendData.length === 0)
      return { totalUsers: 0, totalActivity: 0, totalProjects: 0, userGrowth: 0 };

    const latest = trendData[trendData.length - 1];
    const previous = trendData.length > 1 ? trendData[trendData.length - 2] : null;

    const userGrowth =
      previous && previous.users > 0 ? ((latest.users - previous.users) / previous.users) * 100 : 0;

    return {
      totalUsers: latest.users,
      totalActivity: latest.activity,
      totalProjects: latest.projects,
      userGrowth: userGrowth.toFixed(1),
    };
  }, [trendData]);

  return {
    loading,
    isOffline,
    trendData,
    distributionData,
    comparisonData,
    overviewMetrics,
  };
};

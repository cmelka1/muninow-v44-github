import { useCallback, useRef } from 'react';

interface QueryMetrics {
  queryName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  filters?: Record<string, any>;
  resultCount?: number;
  error?: string;
  cacheHit?: boolean;
}

interface PerformanceLogger {
  log: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
  metrics: (metric: QueryMetrics) => void;
}

const SLOW_QUERY_THRESHOLD = 500; // ms
const VERY_SLOW_QUERY_THRESHOLD = 1000; // ms

class PerformanceManager {
  private metrics: QueryMetrics[] = [];
  private sessionKey = 'municipal_permits_performance';

  constructor() {
    this.loadStoredMetrics();
  }

  private loadStoredMetrics() {
    try {
      const stored = sessionStorage.getItem(this.sessionKey);
      if (stored) {
        this.metrics = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load stored performance metrics:', error);
    }
  }

  private saveMetrics() {
    try {
      sessionStorage.setItem(this.sessionKey, JSON.stringify(this.metrics.slice(-100))); // Keep last 100
    } catch (error) {
      console.warn('Failed to save performance metrics:', error);
    }
  }

  log(level: 'log' | 'warn' | 'error', queryName: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      queryName,
      level,
      message,
      ...data
    };

    console.group(`🔍 [${level.toUpperCase()}] Municipal Permits Performance`);
    console.log(`Query: ${queryName}`);
    console.log(`Time: ${timestamp}`);
    console.log(`Message: ${message}`);
    if (data) {
      console.log('Data:', data);
    }
    console.groupEnd();
  }

  addMetric(metric: QueryMetrics) {
    const completeMetric = {
      ...metric,
      timestamp: Date.now()
    };

    this.metrics.push(completeMetric);
    this.saveMetrics();

    // Log slow queries
    if (metric.duration) {
      if (metric.duration > VERY_SLOW_QUERY_THRESHOLD) {
        this.log('error', metric.queryName, `VERY SLOW QUERY detected: ${metric.duration}ms`, {
          filters: metric.filters,
          resultCount: metric.resultCount,
          threshold: VERY_SLOW_QUERY_THRESHOLD
        });
      } else if (metric.duration > SLOW_QUERY_THRESHOLD) {
        this.log('warn', metric.queryName, `Slow query detected: ${metric.duration}ms`, {
          filters: metric.filters,
          resultCount: metric.resultCount,
          threshold: SLOW_QUERY_THRESHOLD
        });
      }
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getSlowQueries() {
    return this.metrics.filter(m => m.duration && m.duration > SLOW_QUERY_THRESHOLD);
  }

  getAverageQueryTime(queryName?: string) {
    const filtered = queryName 
      ? this.metrics.filter(m => m.queryName === queryName && m.duration)
      : this.metrics.filter(m => m.duration);
    
    if (filtered.length === 0) return 0;
    
    const total = filtered.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / filtered.length;
  }

  generateReport() {
    const total = this.metrics.length;
    const completed = this.metrics.filter(m => m.duration).length;
    const slow = this.getSlowQueries().length;
    const averageTime = this.getAverageQueryTime();

    console.group('📊 Municipal Permits Performance Report');
    console.log(`Total Queries: ${total}`);
    console.log(`Completed: ${completed}`);
    console.log(`Slow Queries (>${SLOW_QUERY_THRESHOLD}ms): ${slow}`);
    console.log(`Average Query Time: ${averageTime.toFixed(2)}ms`);
    console.log(`Cache Hit Rate: Not implemented yet`);
    console.table(this.getSlowQueries().map(m => ({
      Query: m.queryName,
      Duration: `${m.duration}ms`,
      Filters: JSON.stringify(m.filters),
      Results: m.resultCount
    })));
    console.groupEnd();
  }
}

const performanceManager = new PerformanceManager();

export const useQueryPerformance = (): PerformanceLogger => {
  const activeQueries = useRef<Map<string, QueryMetrics>>(new Map());

  const startQuery = useCallback((queryName: string, filters?: Record<string, any>) => {
    const startTime = performance.now();
    const queryId = `${queryName}_${startTime}`;
    
    const metric: QueryMetrics = {
      queryName,
      startTime,
      filters
    };

    activeQueries.current.set(queryId, metric);
    
    performanceManager.log('log', queryName, 'Query started', {
      filters,
      queryId,
      activeQueries: activeQueries.current.size
    });

    return queryId;
  }, []);

  const endQuery = useCallback((queryId: string, resultCount?: number, error?: string, cacheHit?: boolean) => {
    const metric = activeQueries.current.get(queryId);
    if (!metric) {
      performanceManager.log('warn', 'unknown', 'Attempted to end unknown query', { queryId });
      return;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    const completedMetric: QueryMetrics = {
      ...metric,
      endTime,
      duration,
      resultCount,
      error,
      cacheHit
    };

    activeQueries.current.delete(queryId);
    performanceManager.addMetric(completedMetric);

    performanceManager.log('log', metric.queryName, 'Query completed', {
      duration: `${duration.toFixed(2)}ms`,
      resultCount,
      error,
      cacheHit,
      remaining: activeQueries.current.size
    });
  }, []);

  return {
    log: (message: string, data?: any) => {
      performanceManager.log('log', 'general', message, data);
    },
    warn: (message: string, data?: any) => {
      performanceManager.log('warn', 'general', message, data);
    },
    error: (message: string, data?: any) => {
      performanceManager.log('error', 'general', message, data);
    },
    metrics: (metric: QueryMetrics) => {
      performanceManager.addMetric(metric);
    }
  };
};

// Global performance utilities
export const performanceUtils = {
  generateReport: () => performanceManager.generateReport(),
  getMetrics: () => performanceManager.getMetrics(),
  getSlowQueries: () => performanceManager.getSlowQueries(),
  startQuery: (queryName: string, filters?: Record<string, any>) => {
    const startTime = performance.now();
    performanceManager.log('log', queryName, 'Manual query start', { filters });
    return startTime;
  },
  endQuery: (queryName: string, startTime: number, resultCount?: number, error?: string) => {
    const duration = performance.now() - startTime;
    performanceManager.addMetric({
      queryName,
      startTime,
      endTime: performance.now(),
      duration,
      resultCount,
      error
    });
  }
};

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).municipalPerformance = performanceUtils;
}
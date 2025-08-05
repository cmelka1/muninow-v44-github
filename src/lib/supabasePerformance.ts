import { supabase } from '@/integrations/supabase/client';
import { performanceUtils } from '@/hooks/useQueryPerformance';

interface SupabaseQueryInfo {
  table: string;
  operation: string;
  filters: Record<string, any>;
  select?: string;
  range?: { from: number; to: number };
  order?: Array<{ column: string; ascending: boolean }>;
}

class SupabasePerformanceWrapper {
  private extractQueryInfo(query: any): SupabaseQueryInfo {
    const info: SupabaseQueryInfo = {
      table: 'unknown',
      operation: 'unknown',
      filters: {}
    };

    try {
      // Extract table name from the query
      if (query.url) {
        const urlParts = query.url.pathname.split('/');
        const tableIndex = urlParts.indexOf('rest') + 2;
        if (tableIndex < urlParts.length) {
          info.table = urlParts[tableIndex];
        }
      }

      // Extract operation from method
      if (query.method) {
        switch (query.method.toLowerCase()) {
          case 'get':
            info.operation = 'SELECT';
            break;
          case 'post':
            info.operation = 'INSERT';
            break;
          case 'patch':
            info.operation = 'UPDATE';
            break;
          case 'delete':
            info.operation = 'DELETE';
            break;
          default:
            info.operation = query.method.toUpperCase();
        }
      }

      // Extract query parameters
      if (query.url && query.url.searchParams) {
        const params = Object.fromEntries(query.url.searchParams.entries());
        
        // Extract filters
        Object.keys(params).forEach(key => {
          if (key === 'select') {
            info.select = params[key];
          } else if (key === 'order') {
            info.order = params[key].split(',').map((o: string) => {
              const [column, direction] = o.split('.');
              return { column, ascending: direction !== 'desc' };
            });
          } else if (key.includes('=')) {
            info.filters[key] = params[key];
          }
        });
      }
    } catch (error) {
      console.warn('Failed to extract query info:', error);
    }

    return info;
  }

  logSupabaseQuery(query: any, duration: number, error?: any) {
    const queryInfo = this.extractQueryInfo(query);
    const queryName = `${queryInfo.operation}_${queryInfo.table}`;

    console.group(`🗃️ Supabase Query Performance`);
    console.log(`Operation: ${queryInfo.operation}`);
    console.log(`Table: ${queryInfo.table}`);
    console.log(`Duration: ${duration.toFixed(2)}ms`);
    
    if (queryInfo.select) {
      console.log(`Select: ${queryInfo.select}`);
    }
    
    if (Object.keys(queryInfo.filters).length > 0) {
      console.log('Filters:', queryInfo.filters);
    }
    
    if (queryInfo.order) {
      console.log('Order:', queryInfo.order);
    }
    
    if (error) {
      console.error('Error:', error);
    }
    
    console.groupEnd();

    // Log to performance manager
    performanceUtils.endQuery(
      queryName,
      performance.now() - duration,
      undefined, // result count not available at this level
      error?.message
    );

    // Warn about slow queries
    if (duration > 1000) {
      console.warn(`🐌 SLOW SUPABASE QUERY: ${queryName} took ${duration.toFixed(2)}ms`);
    } else if (duration > 500) {
      console.warn(`⚠️ Slow Supabase query: ${queryName} took ${duration.toFixed(2)}ms`);
    }
  }

  wrapSupabaseClient() {
    // Intercept fetch requests to track Supabase queries
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options] = args;
      const isSupabaseQuery = typeof url === 'string' && url.includes('supabase.co');
      
      if (!isSupabaseQuery) {
        return originalFetch(...args);
      }

      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        this.logSupabaseQuery({
          url: new URL(url),
          method: options?.method || 'GET'
        }, duration);
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        this.logSupabaseQuery({
          url: new URL(url),
          method: options?.method || 'GET'
        }, duration, error);
        
        throw error;
      }
    };
  }
}

const supabasePerformance = new SupabasePerformanceWrapper();

// Initialize performance monitoring
supabasePerformance.wrapSupabaseClient();

export { supabasePerformance };
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * API Caching Custom Hook
 * 
 * Features:
 * 1. Memory caching - Store API responses in a Map outside component
 * 2. Parallel request handling - Share ongoing Promises to prevent duplicate requests
 * 3. Cache invalidation - Manual and time-based expiry support
 */

// Cache storage (outside component = persists across all component instances)
interface CacheEntry<T> {
  data: T;                    // The actual response data
  timestamp: number;          // When we cached it
  promise?: Promise<T>;       // Ongoing request (for parallel handling)
}

const cache = new Map<string, CacheEntry<unknown>>();

// Default cache expiry: 5 minutes (configurable)
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface UseFetchWithCacheOptions {
  cacheKey?: string;          // Custom cache key (defaults to URL)
  ttl?: number;               // Time-to-live in milliseconds
  enabled?: boolean;          // Skip fetch if false (like React Query)
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

export interface UseFetchWithCacheResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;           // Force fresh fetch (bypass cache)
  invalidate: () => void;                 // Remove from cache
  invalidateAll: () => void;              // Clear entire cache
}

/**
 * useFetchWithCache Hook
 * 
 * Flow:
 * 1. Check cache first - if found and fresh, return cached data
 * 2. Check if request already in progress - share that Promise
 * 3. Otherwise - make new fetch, cache it, and return
 */
export function useFetchWithCache<T = unknown>(
  url: string | null,
  options?: RequestInit & UseFetchWithCacheOptions
): UseFetchWithCacheResult<T> {
  // Extract our custom options from fetch options
  const {
    cacheKey,
    ttl = DEFAULT_CACHE_TTL,
    enabled = true,
    onSuccess,
    onError,
    ...fetchOptions
  } = options || {};

  // State for component to re-render when data changes
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Use ref to track if component is mounted (avoid setState on unmounted component)
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Cache lookup function
   * Returns cached data if it exists and hasn't expired
   */
  const getCachedData = useCallback((key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;

    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > ttl) {
      cache.delete(key); // Auto-remove expired entries
      return null;
    }

    return entry.data as T;
  }, [ttl]);

  /**
   * Fetch function - handles caching and parallel requests
   */
  const fetchData = useCallback(async (forceRefresh = false): Promise<void> => {
    // Skip if no URL or disabled
    if (!url || !enabled) {
      setLoading(false);
      return;
    }

    // Create unique cache key (URL + options if needed)
    const key = cacheKey || `${url}${JSON.stringify(fetchOptions)}`;

    // Step 1: Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = getCachedData(key);
      if (cached !== null) {
        // Cache hit - return immediately
        setData(cached);
        setLoading(false);
        setError(null);
        return;
      }

      // Step 2: Check if same request is already in progress
      const existingEntry = cache.get(key);
      if (existingEntry?.promise) {
        // Parallel request detected - share the existing Promise
        try {
          const sharedData = await existingEntry.promise;
          if (isMountedRef.current) {
            setData(sharedData as T);
            setLoading(false);
            setError(null);
          }
          return;
        } catch (err) {
          if (isMountedRef.current) {
            setError(err instanceof Error ? err : new Error('Fetch failed'));
            setLoading(false);
          }
          return;
        }
      }
    }

    // Step 3: Make new fetch request
    setLoading(true);
    setError(null);

    // Create the fetch Promise
    const fetchPromise = fetch(url, fetchOptions)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        return jsonData as T;
      })
      .then((jsonData) => {
        // Store in cache BEFORE we resolve
        cache.set(key, {
          data: jsonData,
          timestamp: Date.now(),
          promise: undefined, // Clear promise once done
        });

        // Call success callback if provided
        onSuccess?.(jsonData);

        return jsonData;
      })
      .catch((err) => {
        // Remove failed request from cache
        cache.delete(key);
        onError?.(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      });

    // Store the Promise in cache for parallel requests
    if (!forceRefresh) {
      cache.set(key, {
        data: null as unknown, // We don't have data yet
        timestamp: Date.now(),
        promise: fetchPromise, // Share this Promise!
      });
    }

    // Wait for fetch and update state
    try {
      const result = await fetchPromise;
      if (isMountedRef.current) {
        setData(result);
        setLoading(false);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Fetch failed'));
        setLoading(false);
      }
    }
  }, [url, enabled, cacheKey, fetchOptions, getCachedData, onSuccess, onError]);

  // Auto-fetch on mount or when URL changes
  useEffect(() => {
    // Defer execution to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      void fetchData(false);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchData]);

  /**
   * Refetch - Force fresh data (bypasses cache)
   */
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  /**
   * Invalidate - Remove specific URL from cache
   */
  const invalidate = useCallback(() => {
    if (!url) return;
    const key = cacheKey || `${url}${JSON.stringify(fetchOptions)}`;
    cache.delete(key);
    // Optionally refetch after invalidation
    // fetchData(true);
  }, [url, cacheKey, fetchOptions]);

  /**
   * Invalidate all - Clear entire cache
   */
  const invalidateAll = useCallback(() => {
    cache.clear();
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    invalidateAll,
  };
}

/**
 * Standalone cache utility functions
 * Can be used outside the hook
 */
export const cacheUtils = {
  /**
   * Clear cache for a specific URL
   */
  invalidate: (url: string, options?: RequestInit) => {
    const key = `${url}${JSON.stringify(options || {})}`;
    cache.delete(key);
  },

  /**
   * Clear entire cache
   */
  clear: () => {
    cache.clear();
  },

  /**
   * Get cache size (useful for debugging)
   */
  size: () => cache.size,

  /**
   * Check if URL is cached
   */
  has: (url: string, options?: RequestInit) => {
    const key = `${url}${JSON.stringify(options || {})}`;
    return cache.has(key);
  },
};





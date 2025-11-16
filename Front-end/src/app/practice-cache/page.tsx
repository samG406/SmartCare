'use client';

/**
 * Practice Page: API Caching with useFetchWithCache
 * 
 * Test scenarios:
 * 1. Load the same URL twice - second time is instant (from cache)
 * 2. Load multiple components with same URL - only ONE API call (parallel handling)
 * 3. Invalidate cache - next fetch goes to API again
 * 4. Watch the network tab to see when real API calls happen
 */

import React, { useState } from 'react';
import { useFetchWithCache, cacheUtils } from '@/hooks/useFetchWithCache';

// Mock API endpoint (you can change this to a real one)
const DEMO_API_URL = 'https://jsonplaceholder.typicode.com/posts/1';

export default function PracticeCachePage() {
  const [testUrl, setTestUrl] = useState(DEMO_API_URL);
  const [showMultiple, setShowMultiple] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Practice: API Caching Hook
          </h1>
          <p className="text-gray-600">
            Learn by doing! Watch how caching works in real-time.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API URL:
              </label>
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://jsonplaceholder.typicode.com/posts/1"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => cacheUtils.clear()}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                Clear All Cache
              </button>
              
              <button
                onClick={() => cacheUtils.invalidate(testUrl)}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
              >
                Invalidate This URL
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showMultiple"
                  checked={showMultiple}
                  onChange={(e) => setShowMultiple(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="showMultiple" className="text-sm text-gray-700">
                  Show Multiple Components (Parallel Request Test)
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Open DevTools Network tab to see when real API calls happen!
                Cache hits = no network request = instant
              </p>
            </div>
          </div>
        </div>

        {/* Example Component 1 */}
        <DataComponent 
          url={testUrl} 
          title="Component 1" 
          color="blue" 
        />

        {/* Example Component 2 (same URL - shows cache in action) */}
        <DataComponent 
          url={testUrl} 
          title="Component 2 (Same URL = Cache Hit)" 
          color="green" 
        />

        {/* Multiple Components (for parallel request testing) */}
        {showMultiple && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <DataComponent 
              url={testUrl} 
              title="Component A" 
              color="purple" 
            />
            <DataComponent 
              url={testUrl} 
              title="Component B" 
              color="pink" 
            />
            <DataComponent 
              url={testUrl} 
              title="Component C" 
              color="indigo" 
            />
          </div>
        )}

        {/* Cache Stats */}
        <CacheStatsPanel />
      </div>
    </div>
  );
}

/**
 * Reusable component using the hook
 */
interface DataComponentProps {
  url: string;
  title: string;
  color: string;
}

function DataComponent({ url, title, color }: DataComponentProps) {
  const { data, loading, error, refetch, invalidate } = useFetchWithCache<Record<string, unknown>>(url);

  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    purple: 'border-purple-500 bg-purple-50',
    pink: 'border-pink-500 bg-pink-50',
    indigo: 'border-indigo-500 bg-indigo-50',
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 ${colorClasses[color as keyof typeof colorClasses]} p-6 mb-4`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition"
            title="Force fresh fetch"
          >
            Refetch
          </button>
          <button
            onClick={() => invalidate()}
            className="px-3 py-1 text-xs bg-red-200 hover:bg-red-300 rounded transition"
            title="Remove from cache"
          >
            Invalidate
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          URL: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{url}</code>
        </p>

        {loading && (
          <div className="flex items-center gap-2 text-blue-600">
            <span className="animate-spin">Loading...</span>
            <span>Loading from API...</span>
          </div>
        )}

        {!loading && data && (
          <div className="mt-4">
            <div className="bg-green-100 border border-green-300 rounded p-2 mb-2">
              <span className="text-green-800 text-sm font-medium">Cached Data (or fresh from API)</span>
            </div>
            <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto text-xs max-h-64">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 rounded p-3">
            <p className="text-red-800 text-sm font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error.message}</p>
          </div>
        )}

        {!loading && !data && !error && (
          <p className="text-gray-500 text-sm">No data yet...</p>
        )}
      </div>
    </div>
  );
}

/**
 * Cache stats panel - shows current cache state
 */
function CacheStatsPanel() {
  const [, setRefresh] = useState(0);

  // Force re-render every second to show live stats
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRefresh((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Cache Statistics</h2>
        <span className="text-sm text-gray-500">Auto-refreshing...</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{cacheUtils.size()}</div>
          <div className="text-sm text-gray-600">Cached Items</div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-900">Memory</div>
          <div className="text-sm text-blue-600">Memory Cache</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-900">Persistent</div>
          <div className="text-sm text-green-600">Persists Until Clear</div>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Learning Points:</h3>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li><strong>Cache Hit:</strong> Same URL requested again → instant data, no API call</li>
          <li><strong>Parallel Requests:</strong> Multiple components request same URL → only 1 API call shared</li>
          <li><strong>Cache Invalidation:</strong> Remove entry → next request fetches fresh data</li>
          <li><strong>Time-based Expiry:</strong> Cache expires after 5 minutes (configurable)</li>
        </ul>
      </div>
    </div>
  );
}





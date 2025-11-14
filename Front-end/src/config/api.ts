const getApiUrl = () => {
  // If explicitly set via environment variable, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Production AWS Elastic Beanstalk endpoint
  return 'http://smartcare-env.eba-vpus5s3b.us-east-2.elasticbeanstalk.com';
};

export const API_URL = getApiUrl();

// Check if we're in a browser environment with HTTPS
const isHttpsFrontend = typeof window !== 'undefined' && window.location.protocol === 'https:';
const isHttpBackend = API_URL.startsWith('http://');

// Use proxy route if frontend is HTTPS and backend is HTTP (mixed content issue)
export const shouldUseProxy = isHttpsFrontend && isHttpBackend;

// Log API URL in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API URL configured:', API_URL);
  console.log('Environment variable NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('Using proxy:', shouldUseProxy);
}

export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  // If we need to use proxy (HTTPS frontend -> HTTP backend), route through Next.js API
  if (shouldUseProxy && typeof window !== 'undefined') {
    const method = options?.method || 'GET';
    const proxyUrl = `/api/proxy?endpoint=${encodeURIComponent(endpoint)}`;
    
    // For GET/DELETE, use query params
    if (method === 'GET' || method === 'DELETE') {
      return fetch(proxyUrl, {
        method,
        headers: options?.headers,
      });
    }
    
    // For POST/PUT/PATCH, include body
    const body = options?.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};
    return fetch(proxyUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string> || {}),
      },
      body: JSON.stringify(body),
    });
  }
  
  // Direct API call
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  return fetch(url, options);
};


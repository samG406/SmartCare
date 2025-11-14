const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Default fallback
  return 'http://smartcare-env.eba-vpus5s3b.us-east-2.elasticbeanstalk.com';
};

export const API_URL = getApiUrl();

// Log API URL in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API URL configured:', API_URL);
  console.log('Environment variable NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
}

export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  return fetch(url, options);
};


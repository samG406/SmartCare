
const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  return 'http://smartcare-env.eba-vpus5s3b.us-east-2.elasticbeanstalk.com';
};

export const API_URL = getApiUrl();

export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  return fetch(url, options);
};


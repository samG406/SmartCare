// Debug utility to test API connection
export const testApiConnection = async () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://smartcare-env.eba-vpus5s3b.us-east-2.elasticbeanstalk.com';
  
  console.log('=== API Connection Test ===');
  console.log('API_URL:', API_URL);
  console.log('Current origin:', typeof window !== 'undefined' ? window.location.origin : 'server');
  
  try {
    const response = await fetch(`${API_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response data:', data);
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Test Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    console.error('Error message:', errorMessage);
    console.error('Error name:', errorName);
    return { success: false, error: errorMessage };
  }
};





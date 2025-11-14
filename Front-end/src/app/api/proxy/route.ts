// Proxy API route to avoid mixed content issues (HTTPS frontend -> HTTP backend)
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://smartcare-env.eba-vpus5s3b.us-east-2.elasticbeanstalk.com';

export async function POST(request: NextRequest) {
  return handleProxyRequest(request, 'POST');
}

export async function GET(request: NextRequest) {
  return handleProxyRequest(request, 'GET');
}

export async function PUT(request: NextRequest) {
  return handleProxyRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleProxyRequest(request, 'DELETE');
}

export async function PATCH(request: NextRequest) {
  return handleProxyRequest(request, 'PATCH');
}

async function handleProxyRequest(request: NextRequest, method: string) {
  try {
    const { searchParams } = new URL(request.url);
    let endpoint = searchParams.get('endpoint');
    let body: Record<string, unknown> = {};
    
    // Parse body for POST/PUT/PATCH requests
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        const parsedBody = await request.json() as Record<string, unknown>;
        body = parsedBody;
        // If endpoint not in query string, try to get from body
        if (!endpoint && typeof parsedBody.endpoint === 'string') {
          endpoint = parsedBody.endpoint;
        }
      } catch {
        // Body parsing failed or no body, continue with empty body
        body = {};
      }
    }
    
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    return await proxyRequest(endpoint, method, body, request);
  } catch (error) {
    console.error('Proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Proxy request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

async function proxyRequest(endpoint: string, method: string, body: Record<string, unknown>, request: NextRequest) {
  // Remove endpoint from body if it exists (it's already extracted)
  const { endpoint: _endpoint, ...restBody } = body;
  // Suppress unused variable warning - we're intentionally extracting it
  void _endpoint;
  
  const url = `${BACKEND_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Forward headers (excluding host and connection)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Forward authorization header if present
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (method !== 'GET' && method !== 'DELETE' && Object.keys(restBody).length > 0) {
    fetchOptions.body = JSON.stringify(restBody);
  }

  const response = await fetch(url, fetchOptions);
  const data = await response.json().catch(() => ({ error: 'Failed to parse response' }));
  
  return NextResponse.json(data, { status: response.status });
}





// Proxy API route to avoid mixed content issues (HTTPS frontend -> HTTP backend)
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://smartcare-env.eba-vpus5s3b.us-east-2.elasticbeanstalk.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, ...rest } = body;
    
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    const url = `${BACKEND_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rest),
    });

    const data = await response.json().catch(() => ({ error: 'Failed to parse response' }));
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Proxy request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}





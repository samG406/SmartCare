import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // This is a Next.js API route that can replace some backend functionality
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // In a real app, you'd fetch from your database
    const mockData = {
      appointments: [
        { id: 1, patient: 'John Doe', time: '09:00 AM', status: 'confirmed' },
        { id: 2, patient: 'Jane Smith', time: '10:30 AM', status: 'pending' },
        { id: 3, patient: 'Bob Johnson', time: '02:00 PM', status: 'confirmed' },
      ],
      total: 3,
    };
    
    return NextResponse.json(mockData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real app, you'd save to your database
    const newAppointment = {
      id: Date.now(),
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // For JWT-based auth, we just need to tell the client to remove the token
    // The actual token invalidation happens on the client side
    return NextResponse.json({
      message: 'Sign out successful'
    });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
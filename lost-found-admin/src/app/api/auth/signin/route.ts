import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function POST(request: Request) {
  try {
    console.log('[Auth API] Sign-in attempt started');
    await connectDB();
    
    const { email, password } = await request.json();
    console.log('[Auth API] Received credentials for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('[Auth API] Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('[Auth API] User lookup result:', user ? 'Found' : 'Not found');
    
    if (!user) {
      console.log('[Auth API] User not found for email:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('[Auth API] User found - Role:', user.role, 'Email:', user.email);

    // Check if user is admin
    if (user.role !== 'admin') {
      console.log('[Auth API] User is not admin. Role:', user.role);
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Verify password
    let isPasswordValid = false;
    
    console.log('[Auth API] Testing password...');
    
    // First try direct comparison (for plain text passwords)
    if (user.password === password) {
      console.log('[Auth API] Password matched (plain text)');
      isPasswordValid = true;
    } else {
      // Then try bcrypt comparison (for hashed passwords)
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('[Auth API] Password bcrypt comparison result:', isPasswordValid);
      } catch (error) {
        console.log('[Auth API] Bcrypt comparison failed:', error);
        isPasswordValid = false;
      }
    }

    if (!isPasswordValid) {
      console.log('[Auth API] Password validation failed');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('[Auth API] Password validated successfully');

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('[Auth API] JWT token generated successfully');

    const responseData = {
      message: 'Sign in successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role
      }
    };

    console.log('[Auth API] Sending success response');

    // Return success response with token and user info
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('[Auth API] Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';

export async function GET(request: Request) {
  let connection;
  try {
    // Establish database connection
    connection = await connectDB();
    if (!connection || connection.readyState !== 1) {
      console.error('Database connection is not ready');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Build filter object
    const filters: any = {};
    
    // Apply filters if they exist
    const reportType = searchParams.get('reportType');
    const status = searchParams.get('status');
    const fraud = searchParams.get('fraud');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    if (reportType && reportType !== 'all') {
      filters.reportType = reportType;
    }
    
    if (status && status !== 'all') {
      filters.status = status;
    }
    
    if (fraud && fraud !== 'all') {
      filters.fraud = fraud === 'true';
    }
    
    if (category && category !== 'all') {
      filters['itemDetails.category'] = category;
    }

    // Add search functionality
    if (search) {
      filters.$or = [
        { 'itemDetails.title': { $regex: search, $options: 'i' } },
        { 'itemDetails.description': { $regex: search, $options: 'i' } },
        { 'itemDetails.category': { $regex: search, $options: 'i' } },
        { 'locationDetails.lastSeenLocation.city': { $regex: search, $options: 'i' } }
      ];
    }

    console.log('[Reports API] Applying filters:', filters);
    console.log('[Reports API] Executing database query...');

    const reports = await Report.find(filters)
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[Reports API] Found ${reports.length} reports`);

    // Add cache-busting headers to ensure fresh data
    const response = NextResponse.json(reports);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('API Error:', error);
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed', details: error.message },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch reports', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  let connection;
  try {
    // Establish database connection
    connection = await connectDB();
    if (!connection || connection.readyState !== 1) {
      console.error('Database connection is not ready');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    const { id, ...updateData } = await request.json();
    console.log(`[Reports API] Updating report ${id} with data:`, updateData);
    
    // Validate the update data
    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Find the report first to ensure it exists
    const existingReport = await Report.findById(id);
    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Perform the update with validation
    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { 
        new: true,  // Return the updated document
        runValidators: true  // Run model validations
      }
    ).lean();  // Convert to plain object

    if (!updatedReport) {
      return NextResponse.json(
        { error: 'Failed to update report' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('API Error:', error);
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed', details: error.message },
        { status: 503 }
      );
    }
    // Check if it's a validation error
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  let connection;
  try {
    // Establish database connection
    connection = await connectDB();
    if (!connection || connection.readyState !== 1) {
      console.error('Database connection is not ready');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    const { id } = await request.json();
    
    const deletedReport = await Report.findByIdAndDelete(id);
    
    if (!deletedReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('API Error:', error);
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed', details: error.message },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
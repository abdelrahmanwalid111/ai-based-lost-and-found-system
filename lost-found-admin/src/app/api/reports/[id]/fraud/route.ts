import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { fraud, fraud_checked, fraud_reason } = await request.json();
    
    console.log(`[Fraud API] Updating fraud status for report ${params.id}:`, {
      fraud,
      fraud_checked,
      fraud_reason
    });

    // Validate the request data
    if (typeof fraud !== 'boolean') {
      return NextResponse.json(
        { error: 'Fraud status must be a boolean value' },
        { status: 400 }
      );
    }

    // Find the report first to ensure it exists
    const existingReport = await Report.findById(params.id);
    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Update the fraud status
    const updatedReport = await Report.findByIdAndUpdate(
      params.id,
      {
        fraud: fraud,
        fraud_checked: fraud_checked !== undefined ? fraud_checked : true,
        fraud_reason: fraud_reason || (fraud ? 'Marked as fraudulent by admin' : 'Cleared by admin'),
        updatedAt: new Date()
      },
      {
        new: true,  // Return the updated document
        runValidators: true  // Run model validations
      }
    ).lean();  // Convert to plain object

    if (!updatedReport) {
      return NextResponse.json(
        { error: 'Failed to update fraud status' },
        { status: 500 }
      );
    }

    console.log(`[Fraud API] Successfully updated fraud status for report ${params.id}`);

    return NextResponse.json({
      message: 'Fraud status updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Fraud API Error:', error);
    
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
        { error: 'Invalid fraud data', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update fraud status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
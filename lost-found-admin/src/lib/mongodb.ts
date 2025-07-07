import mongoose from 'mongoose';

// Try to get MongoDB URI from environment variables, fallback to default if not available
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://100.65.0.126:27017/Lost_Found_new';

// Define the type for our cached mongoose instance
type MongooseCache = {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Mongoose> | null;
}

// Extend the global namespace
declare global {
  var mongoose: MongooseCache | undefined;
}

// Initialize the cached variable with proper typing
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

// Set the global mongoose cache if not already set
if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<mongoose.Connection> {
  if (cached.conn) {
    // Check if the existing connection is still valid
    if (cached.conn.readyState === 1) {
      return cached.conn;
    } else {
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    const mongoose = await cached.promise;
    cached.conn = mongoose.connection;

    // Add connection event listeners
    cached.conn.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      // Reset cache on error to force new connection attempt
      cached.conn = null;
      cached.promise = null;
    });

    cached.conn.on('disconnected', () => {
      console.log('MongoDB disconnected');
      // Reset the cache to force a new connection on next request
      cached.conn = null;
      cached.promise = null;
    });

    cached.conn.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return cached.conn;
  } catch (e) {
    console.error('Failed to establish MongoDB connection:', e);
    cached.promise = null;
    throw e;
  }
}

export default connectDB; 
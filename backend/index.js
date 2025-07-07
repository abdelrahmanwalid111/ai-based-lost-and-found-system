const express = require('express');
const path = require('path');
const fs = require('fs');
const connectDB = require('./db');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const reportRoutes = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Connect to MongoDB
connectDB();

// Ensure required upload directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const tempDir = path.join(uploadsDir, 'temp');
const lostDir = path.join(uploadsDir, 'lost');
const foundDir = path.join(uploadsDir, 'found');

[uploadsDir, tempDir, lostDir, foundDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created '${dir}' folder.`);
  }
});

// Middleware to parse JSON
app.use(express.json());

// Serve static files from /uploads
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/report', reportRoutes);

console.log("Report routed loaded (from index.js)");

// Root route
app.get('/', (req, res) => {
  console.log('Ping received');
  res.send('Server is running');
});

// Basic error handler (good for debugging and development)
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});

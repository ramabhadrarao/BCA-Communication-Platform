import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import groupRoutes from './routes/groups.js';
import messageRoutes from './routes/messages.js';
import assignmentRoutes from './routes/assignments.js';
import pollRoutes from './routes/polls.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with proper headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    // Set proper MIME types for different file types
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (path.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    } else if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
    
    // Allow cross-origin requests for media files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

// MongoDB connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bca-communication';

console.log('🔗 Attempting to connect to MongoDB...');
console.log('📍 MongoDB URI:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout
  socketTimeoutMS: 45000, // 45 seconds socket timeout
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log('🏠 Database:', mongoose.connection.name);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('🔍 Troubleshooting tips:');
  console.error('   1. Make sure MongoDB service is running');
  console.error('   2. Check if MongoDB is listening on port 27017');
  console.error('   3. Try connecting with: mongosh');
  console.error('   4. Check your .env file configuration');
  
  // Don't exit the process, let it continue for debugging
  // process.exit(1);
});

// MongoDB connection event listeners
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 Mongoose disconnected from MongoDB');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/polls', pollRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
    uploadsPath: path.join(__dirname, 'uploads')
  });
});

// Test endpoint for file serving
app.get('/api/test-uploads', (req, res) => {
  const fs = require('fs');
  const uploadsPath = path.join(__dirname, 'uploads');
  
  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({
      uploadsPath,
      files: files.slice(0, 10), // Show first 10 files
      totalFiles: files.length
    });
  } catch (error) {
    res.json({
      uploadsPath,
      error: error.message,
      exists: fs.existsSync(uploadsPath)
    });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  socket.on('join-group', (groupId) => {
    socket.join(groupId);
    console.log(`👥 User ${socket.id} joined group ${groupId}`);
  });

  socket.on('leave-group', (groupId) => {
    socket.leave(groupId);
    console.log(`👋 User ${socket.id} left group ${groupId}`);
  });

  socket.on('send-message', (data) => {
    console.log('📡 Broadcasting message to group:', data.groupId);
    socket.to(data.groupId).emit('new-message', data.message);
  });

  socket.on('typing', (data) => {
    socket.to(data.groupId).emit('user-typing', data);
  });

  socket.on('stop-typing', (data) => {
    socket.to(data.groupId).emit('user-stop-typing', data);
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('🔌 Socket error:', error);
  });
});

// Handle Socket.IO errors
io.on('error', (error) => {
  console.error('📡 Socket.IO error:', error);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log('=====================================');
  console.log('🚀 BCA Communication Platform Server');
  console.log('=====================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Test uploads: http://localhost:${PORT}/api/test-uploads`);
  console.log(`🗂️ Uploads directory: ${path.join(__dirname, 'uploads')}`);
  console.log('=====================================');
});
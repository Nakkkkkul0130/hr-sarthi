const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://hr-sarthi.vercel.app'
    ];
    
    if (!origin || allowedOrigins.includes(origin) || 
        origin.includes('localhost') || 
        (origin.includes('vercel.app') && origin.includes('hr-sarthi'))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://hr-sarthi.vercel.app'],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  }
});

// Basic middleware
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.url === '/' || req.url === '/api/health'
});
app.use(limiter);

// Logging
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] INFO: ${req.method} ${req.url}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'WARN' : 'INFO';
    console.log(`[${new Date().toISOString()}] ${level}: ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// Root routes - FIRST
app.get('/', (req, res) => {
  res.json({ 
    message: 'HR SARTHI Backend API', 
    status: 'Running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.head('/', (req, res) => {
  res.status(200).end();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    message: 'HR SARTHI API',
    version: '1.0.0',
    status: 'Running'
  });
});

// Static files
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(`[${new Date().toISOString()}] INFO: MongoDB connected`))
  .catch(err => {
    console.error(`[${new Date().toISOString()}] ERROR: MongoDB failed:`, err.message);
    process.exit(1);
  });

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-user', (userId) => {
    socket.join(userId);
  });

  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
  });

  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('send-message', (data) => {
    io.to(data.chatId).emit('new-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API Routes
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/employees', require('./routes/employees'));
  app.use('/api/chat', require('./routes/chat'));
  app.use('/api/messages', require('./routes/messages'));
  app.use('/api/wellness', require('./routes/wellness'));
  app.use('/api/helpdesk', require('./routes/helpdesk'));
  app.use('/api/analytics', require('./routes/analytics'));
  app.use('/api/settings', require('./routes/settings'));
  app.use('/api/ai', require('./routes/ai'));
  app.use('/api/ai', require('./routes/chanakya'));
  app.use('/api/leaves', require('./routes/leaves'));
  app.use('/api/complaints', require('./routes/complaints'));
  app.use('/api/payroll', require('./routes/payroll'));
  app.use('/api/attendance', require('./routes/attendance'));
  app.use('/api/recruitment', require('./routes/recruitment'));
  app.use('/api/projects', require('./routes/projects'));
  app.use('/api/project-chat', require('./routes/projectChat'));
  app.use('/api/tasks', require('./routes/tasks'));
} catch (error) {
  console.log('Some routes may not be available:', error.message);
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'Server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Global setup
global.io = io;
app.set('io', io);

try {
  const MetricsUpdater = require('./utils/metricsUpdater');
  global.metricsUpdater = new MetricsUpdater(io);
} catch (error) {
  console.log('MetricsUpdater not available:', error.message);
}

module.exports = { app, io };
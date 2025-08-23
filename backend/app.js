const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { securityHeaders, corsOptions, apiLimiter } = require('./middleware/security');

const app = express();

// Trust proxy for reverse proxies (important for Render)
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);

// CORS configuration
app.use(cors(corsOptions));

// Additional CORS headers middleware (fallback)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'https://bookstorefrontend-yrgv.onrender.com'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type', 'Authorization', 'X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  next();
});

// Handle proxy headers properly
app.use((req, res, next) => {
  // Log request details for debugging
  console.log('🔍 Request:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    host: req.headers.host,
    'x-forwarded-for': req.headers['x-forwarded-for'],
    'x-forwarded-proto': req.headers['x-forwarded-proto']
  });
  next();
});

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// Rate limiting
app.use('/api', apiLimiter);

// CORS test endpoint (for debugging)
app.get('/cors-test', (req, res) => {
  console.log('🔍 CORS Test endpoint hit');
  console.log('🔍 Request headers:', req.headers);
  console.log('🔍 Request origin:', req.headers.origin);
  res.json({ 
    message: 'CORS test successful',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    corsEnabled: true
  });
});

// Simple test endpoint (no database required)
app.get('/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    database: 'MySQL'
  });
});

// MySQL health check endpoint
app.get('/mysql-health', async (req, res) => {
  try {
    const pool = require('./config/mysql');
    if (!pool) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'MySQL not initialized',
        timestamp: new Date().toISOString()
      });
    }
    
    // Test with a simple query
    const [rows] = await pool.execute('SELECT 1 as test');
    res.json({ 
      status: 'ok', 
      message: 'MySQL connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('🔍 MySQL health check failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'MySQL connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
const apiRoutes = require('./routes/index');
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'BookStore backend is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'MySQL'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'BookStore Management System API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: 'MySQL',
    cors: {
      enabled: true,
      allowedOrigins: process.env.CORS_ORIGIN || 'http://localhost:3000,https://bookstorefrontend-yrgv.onrender.com'
    },
    endpoints: {
      health: '/api/health',
      mysqlHealth: '/mysql-health',
      corsTest: '/cors-test',
      auth: '/api/auth',
      users: '/api/users',
      items: '/api/items',
      sales: '/api/sales',
      categories: '/api/categories',
      reports: '/api/reports',
      settings: '/api/settings'
    }
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app; 
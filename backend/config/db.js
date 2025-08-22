const { Pool } = require('pg');
const logger = require('../utils/logger');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  max: process.env.NODE_ENV === 'production' ? 20 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

console.log('🔍 Database Config:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  ssl: dbConfig.ssl,
  NODE_ENV: process.env.NODE_ENV
});

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    logger.info('✅ PostgreSQL database connected successfully');
    client.release();
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    console.error('🔍 Database connection error details:', error);
    
    // Don't exit in production, let the app handle it gracefully
    if (process.env.NODE_ENV !== 'production') {
      console.error('🔍 Exiting due to database connection failure in development mode');
      process.exit(1);
    } else {
      console.error('🔍 Continuing in production mode despite database connection failure');
    }
  }
};

// Handle pool errors
pool.on('error', (err) => {
  logger.error('Database pool error:', err);
  console.error('🔍 Database pool error:', err);
  if (err.code === 'ECONNRESET') {
    logger.error('Database connection was reset');
  }
});

// Handle pool acquire (only in development)
if (process.env.NODE_ENV === 'development') {
  pool.on('connect', (client) => {
    logger.debug('Client connected to database');
  });

  pool.on('remove', (client) => {
    logger.debug('Client removed from pool');
  });
}

// Test connection on startup
testConnection();

module.exports = pool; 
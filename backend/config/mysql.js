const mysql = require('mysql2/promise');
const logger = require('../utils/logger');
require('dotenv').config();

// Database configuration - support both connection string and individual parameters
let dbConfig;

if (process.env.DATABASE_URL) {
  // Parse connection string
  const url = new URL(process.env.DATABASE_URL);
  dbConfig = {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1), // Remove leading slash
    port: url.port || 4000,
    // TiDB Cloud specific optimizations
    waitForConnections: true,
    connectionLimit: 5, // Reduced for free tier
    queueLimit: 0,
    acquireTimeout: 30000, // Increased timeout for cloud
    timeout: 30000,
    // SSL configuration for TiDB Cloud
    ssl: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    // Connection pool optimizations
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    // Handle connection errors gracefully
    connectionRetryAttempts: 3,
    connectionRetryDelay: 2000
  };
} else {
  // Individual parameters
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000,
    // TiDB Cloud specific optimizations
    waitForConnections: true,
    connectionLimit: process.env.NODE_ENV === 'production' ? 5 : 3, // Reduced for free tier
    queueLimit: 0,
    acquireTimeout: 30000, // Increased timeout for cloud
    timeout: 30000,
    // SSL configuration for TiDB Cloud
    ssl: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    // Connection pool optimizations
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    // Handle connection errors gracefully
    connectionRetryAttempts: 3,
    connectionRetryDelay: 2000
  };
}

console.log('🔍 TiDB Cloud Database Config:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  ssl: dbConfig.ssl,
  NODE_ENV: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',
  connectionLimit: dbConfig.connectionLimit
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('✅ TiDB Cloud database connected successfully');
    console.log('✅ Database connection successful to:', dbConfig.host);
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as timestamp');
    console.log('✅ Test query successful:', rows[0]);
    
    connection.release();
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    console.error('🔍 Database connection error details:', error);
    console.error('🔍 Connection config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      ssl: dbConfig.ssl
    });
    
    // Don't exit in production, let the app handle it gracefully
    if (process.env.NODE_ENV !== 'production') {
      console.error('🔍 Exiting due to database connection failure in development mode');
      process.exit(1);
    } else {
      console.error('🔍 Continuing in production mode despite database connection failure');
      console.error('🔍 Please check your TiDB Cloud connection string and credentials');
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
  pool.on('connection', (client) => {
    logger.debug('Client connected to database');
  });

  pool.on('release', (client) => {
    logger.debug('Client released from pool');
  });
}

// Test connection on startup
testConnection();

module.exports = pool; 
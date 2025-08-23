const mysql = require('mysql2/promise');
const logger = require('../utils/logger');
require('dotenv').config();

// 🔍 Validate required environment variables
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
requiredVars.forEach((key) => {
  if (!process.env[key] && !process.env.DATABASE_URL) {
    console.error(`❌ Missing environment variable: ${key}`);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1); // Fail fast in development
    }
  }
});

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
    waitForConnections: true,
    connectionLimit: 5, // Reduced for free tier
    queueLimit: 0,
    acquireTimeout: 30000,
    timeout: 30000,
    ssl: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    },
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
  };
} else {
  // Individual parameters (no fallback to localhost anymore)
  dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: process.env.NODE_ENV === 'production' ? 5 : 3,
    queueLimit: 0,
    acquireTimeout: 30000,
    timeout: 30000,
    ssl: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    },
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
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
});

// Test connection on startup
testConnection();

module.exports = pool;

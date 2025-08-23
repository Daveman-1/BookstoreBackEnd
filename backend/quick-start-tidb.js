#!/usr/bin/env node

/**
 * Quick Start Script for TiDB Cloud
 * This script helps you test your TiDB Cloud connection and setup
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('🚀 TiDB Cloud Quick Start Script');
console.log('================================\n');

// Check environment variables
console.log('📋 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('DB_HOST:', process.env.DB_HOST || 'not set');
console.log('DB_USER:', process.env.DB_USER || 'not set');
console.log('DB_NAME:', process.env.DB_NAME || 'not set');
console.log('DB_PORT:', process.env.DB_PORT || 'not set');
console.log('');

// Test database connection
async function testConnection() {
  console.log('🔌 Testing TiDB Cloud Connection...');
  
  try {
    let dbConfig;
    
    if (process.env.DATABASE_URL) {
      console.log('📡 Using connection string...');
      const url = new URL(process.env.DATABASE_URL);
      dbConfig = {
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1),
        port: url.port || 4000,
        ssl: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        },
        acquireTimeout: 30000,
        timeout: 30000
      };
    } else if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD) {
      console.log('📡 Using individual parameters...');
      dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 4000,
        ssl: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        },
        acquireTimeout: 30000,
        timeout: 30000
      };
    } else {
      throw new Error('No database configuration found. Please set DATABASE_URL or individual DB_* variables.');
    }
    
    console.log('🔍 Connection config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
      ssl: 'enabled'
    });
    
    // Test connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connection successful!');
    
    // Test basic query
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as timestamp, VERSION() as version');
    console.log('✅ Test query successful:', rows[0]);
    
    // Check if database exists and has tables
    try {
      const [tables] = await connection.execute('SHOW TABLES');
      if (tables.length > 0) {
        console.log('✅ Database has tables:', tables.map(t => Object.values(t)[0]));
      } else {
        console.log('⚠️  Database exists but has no tables. Run setup script.');
      }
    } catch (error) {
      console.log('⚠️  Database might not exist or be empty. Run setup script.');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('1. Check your .env file has correct credentials');
    console.error('2. Verify TiDB Cloud cluster is running');
    console.error('3. Check if database "bookstore_management" exists');
    console.error('4. Ensure your IP is whitelisted (if required)');
    console.error('5. Verify SSL is enabled');
    console.error('');
    console.error('📖 For detailed setup, see TIDB_CLOUD_SETUP.md');
    process.exit(1);
  }
}

// Run connection test
testConnection().then(() => {
  console.log('');
  console.log('🎉 TiDB Cloud connection test completed successfully!');
  console.log('');
  console.log('📚 Next steps:');
  console.log('1. Run the database setup: mysql -h <host> -P 4000 -u <user> -p < setup_mysql_database.sql');
  console.log('2. Start your server: npm run dev');
  console.log('3. Test endpoints: GET /mysql-health, GET /api/health');
  console.log('');
  console.log('🚀 Your BookStore backend is ready for TiDB Cloud!');
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
}); 
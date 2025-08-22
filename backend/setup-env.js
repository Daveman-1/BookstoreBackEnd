#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment variables for local development...\n');

// Check if .env file already exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Skipping creation.');
  console.log('   If you want to recreate it, delete the existing .env file first.\n');
} else {
  // Create .env file with default values
  const envContent = `# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
DB_NAME=bookstore_management
DB_PORT=5432

# JWT Configuration
JWT_SECRET=6bba4b50efb11ff6cdb7e18991f011730744ea13b38515ef3301e51ce7e53fda

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Security
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=debug
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('   Please update the database password and other values as needed.\n');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    process.exit(1);
  }
}

console.log('📋 Next steps:');
console.log('1. Update the .env file with your actual database credentials');
console.log('2. Make sure PostgreSQL is running and accessible');
console.log('3. Run: npm run dev');
console.log('4. Open test-cors.html in your browser to test CORS');
console.log('5. Check the console for CORS debugging information\n');

console.log('🔍 Troubleshooting tips:');
console.log('- Make sure your backend is running on port 5000');
console.log('- Check that your frontend is running on port 3000');
console.log('- Look for CORS debug messages in the backend console');
console.log('- Use the test-cors.html file to debug connection issues\n'); 
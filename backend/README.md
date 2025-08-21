# BookStore Management System Backend

A robust Node.js/Express API for bookstore management, optimized for Render deployment.

## 🚀 Features

- **Authentication & Authorization** - JWT-based authentication with role-based access control
- **Security** - Rate limiting, CORS protection, security headers, input validation
- **Logging** - Comprehensive logging with Winston
- **Error Handling** - Centralized error handling with proper HTTP status codes
- **Database** - PostgreSQL with connection pooling and error recovery
- **Performance** - Compression, optimized database queries
- **Monitoring** - Health checks and graceful shutdown

## 📋 Prerequisites

- Node.js >= 16.0.0
- PostgreSQL >= 13.0
- Git repository (for deployment)

## 🛠️ Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

3. **Database Setup**
   ```sql
   -- Run the SQL files in your PostgreSQL database
   -- create_store_details_table.sql
   -- create_system_settings_table.sql
   -- create_comprehensive_settings.sql
   -- fix_image_url_column.sql
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file based on `env.example`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=bookstore_management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Security
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (JWT required)
- `POST /api/auth/change-password` - Change password (JWT required)

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create new sale
- `GET /api/sales/reports` - Get sales reports

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

### Reports
- `GET /api/reports` - Get various reports

### Settings
- `GET /api/settings` - Get system settings
- `PUT /api/settings` - Update system settings

### Health Check
- `GET /api/health` - Server health status

## 🚀 Deploy to Render

### Quick Deployment

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Create Render Service**
   - Go to [render.com](https://render.com)
   - Click **"New +"** → **"Web Service"**
   - Connect your Git repository

3. **Configure Service**
   - **Name**: `bookstore-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`

4. **Environment Variables**
   ```env
   NODE_ENV=production
   PORT=10000
   DB_HOST=your-database-host
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   DB_NAME=bookstore_management
   JWT_SECRET=your-very-long-and-random-secret-key
   CORS_ORIGIN=https://yourdomain.com
   ```

📖 **Detailed Guide**: See [RENDER_QUICK_START.md](./RENDER_QUICK_START.md)

## 🔒 Security Features

- **Rate Limiting** - Prevents abuse with configurable limits
- **CORS Protection** - Configurable cross-origin resource sharing
- **Security Headers** - Helmet.js for security headers
- **Input Validation** - Express-validator for request validation
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage

## 📊 Logging

The application uses Winston for comprehensive logging:

- **Console Logging** - Colored output for development
- **File Logging** - Separate files for errors and all logs
- **HTTP Logging** - Request/response logging with Morgan
- **Error Logging** - Detailed error tracking

Log files are stored in the `logs/` directory:
- `logs/all.log` - All application logs
- `logs/error.log` - Error logs only

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🔍 Monitoring

### Health Check
```bash
curl https://your-service-name.onrender.com/api/health
```

### Log Monitoring
```bash
# View real-time logs in Render dashboard
# Or locally:
tail -f logs/all.log
tail -f logs/error.log
```

## 🛡️ Security Checklist

- [ ] Strong JWT secret configured
- [ ] CORS origins properly set
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Input validation implemented
- [ ] Error messages don't leak sensitive information
- [ ] Database credentials secured
- [ ] SSL/HTTPS enabled (automatic on Render)

## 📞 Support

For support, please check the logs in the `logs/` directory or contact the development team.

---

**Your BookStore backend is production-ready for Render deployment!** 🚀 
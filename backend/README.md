# BookStore Management System Backend

A robust Node.js/Express API for bookstore management, optimized for TiDB Cloud deployment.

## 🚀 Features

- **Authentication & Authorization** - JWT-based authentication with role-based access control
- **Security** - Rate limiting, CORS protection, security headers, input validation
- **Logging** - Comprehensive logging with Winston
- **Error Handling** - Centralized error handling with proper HTTP status codes
- **Database** - MySQL-compatible TiDB Cloud with connection pooling and error recovery
- **Performance** - Compression, optimized database queries
- **Monitoring** - Health checks and graceful shutdown
- **Cloud Ready** - Optimized for TiDB Cloud free tier

## 📋 Prerequisites

- Node.js >= 16.0.0
- TiDB Cloud account (free tier available)
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
   
   # Edit .env with your TiDB Cloud configuration
   nano .env
   ```

3. **TiDB Cloud Setup**
   ```bash
   # Follow the detailed guide in TIDB_CLOUD_SETUP.md
   # Or use the quick setup below
   ```

4. **Quick TiDB Cloud Setup**
   ```bash
   # 1. Sign up at tidbcloud.com
   # 2. Create a free cluster
   # 3. Get your connection string
   # 4. Add to .env file:
   DATABASE_URL=mysql://22gYCn4NgAaSE8F.root:<PASSWORD>@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/bookstore_management
   ```

5. **Database Setup**
   ```bash
   # Run the MySQL setup script on TiDB Cloud
   mysql -h gateway01.eu-central-1.prod.aws.tidbcloud.com -P 4000 -u 22gYCn4NgAaSE8F.root -p < setup_mysql_database.sql
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file based on `env.example`:

```env
# Database Configuration (TiDB Cloud - MySQL Compatible)
# Option 1: Use connection string (recommended)
DATABASE_URL=mysql://22gYCn4NgAaSE8F.root:<PASSWORD>@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/bookstore_management

# Option 2: Use individual parameters
# DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
# DB_USER=22gYCn4NgAaSE8F.root
# DB_PASSWORD=your_password_here
# DB_NAME=bookstore_management
# DB_PORT=4000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration (for production)
CORS_ORIGIN=https://your-frontend-domain.com

# Security
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
```

## 🗄️ Database Setup

### TiDB Cloud (Recommended)

1. **Free Tier**: 1GB storage, 5 connections
2. **MySQL Compatible**: Works with existing MySQL code
3. **Auto-scaling**: Handles traffic spikes automatically
4. **Global Distribution**: Multiple regions available

### Local MySQL (Alternative)

If you prefer local development:
```bash
# Install MySQL locally
# Update .env with local credentials
# Run setup script locally
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile (JWT required)
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
- `GET /api/sales/:id` - Get specific sale

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Reports
- `GET /api/reports/daily-sales` - Daily sales summary
- `GET /api/reports/top-selling` - Top selling items
- `GET /api/reports/low-stock` - Low stock alerts

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings/:key` - Update setting
- `POST /api/settings` - Create new setting

### Store Details
- `GET /api/store-details` - Get store information
- `PUT /api/store-details` - Update store details

### Approvals
- `GET /api/approvals` - Get all approvals
- `POST /api/approvals` - Create new approval
- `PUT /api/approvals/:id` - Update approval status
- `DELETE /api/approvals/:id` - Delete approval

## 🚀 Deployment

### Render (Recommended)

1. **Connect Repository**: Link your Git repository
2. **Environment Variables**: Add your `.env` variables
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Deploy**: Click "Deploy"

### Other Platforms

- **Railway**: Auto-deploy on push
- **Heroku**: Traditional deployment
- **Vercel**: Serverless deployment
- **DigitalOcean**: VPS deployment

## 🔍 Health Checks

- **Database Health**: `GET /mysql-health`
- **API Health**: `GET /api/health`
- **Test Endpoint**: `GET /test`
- **CORS Test**: `GET /cors-test`

## 📖 Documentation

- **[TiDB Cloud Setup Guide](TIDB_CLOUD_SETUP.md)** - Complete TiDB Cloud setup
- **[MySQL Migration Summary](MYSQL_MIGRATION_SUMMARY.md)** - Firebase to MySQL migration details
- **[Render Deployment](RENDER_DEPLOYMENT.md)** - Render deployment guide

## 🆘 Troubleshooting

### Common Issues

1. **Connection Failed**: Check TiDB Cloud credentials and connection string
2. **Database Not Found**: Run the setup script on TiDB Cloud
3. **SSL Errors**: TiDB Cloud requires SSL connections
4. **Port Issues**: Default port is 4000, not 3306

### Getting Help

- Check the [TiDB Cloud Setup Guide](TIDB_CLOUD_SETUP.md)
- Review [MySQL Migration Summary](MYSQL_MIGRATION_SUMMARY.md)
- Check application logs for detailed error messages

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting
- CORS protection
- Security headers
- Input validation
- SSL/TLS encryption

## 💰 Cost

- **TiDB Cloud**: Free tier available (1GB, 5 connections)
- **Hosting**: Render free tier, Railway free tier
- **Total**: $0/month for small to medium applications

## 🎯 Next Steps

1. **Setup TiDB Cloud**: Follow the [TiDB Cloud Setup Guide](TIDB_CLOUD_SETUP.md)
2. **Test Locally**: Ensure everything works with your cloud database
3. **Deploy**: Choose your preferred hosting platform
4. **Monitor**: Set up monitoring and alerts
5. **Scale**: Upgrade plans as needed

Your BookStore backend is now ready for cloud deployment with TiDB Cloud! 🚀 
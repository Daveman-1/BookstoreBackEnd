# TiDB Cloud Setup Guide

This guide will help you set up your BookStore backend with TiDB Cloud, a MySQL-compatible cloud database service.

## 🚀 What is TiDB Cloud?

TiDB Cloud is a fully managed, MySQL-compatible cloud database service that offers:
- **Free Tier**: 1GB storage, 1 cluster
- **MySQL Compatibility**: Works with existing MySQL code
- **Global Distribution**: Multiple regions available
- **Auto-scaling**: Handles traffic spikes automatically

## 📋 Prerequisites

1. **TiDB Cloud Account**: Sign up at [tidbcloud.com](https://tidbcloud.com)
2. **Node.js**: Version 16.0.0 or higher
3. **Git**: For version control

## 🔧 Step 1: Create TiDB Cloud Cluster

1. **Sign In**: Go to [tidbcloud.com](https://tidbcloud.com) and sign in
2. **Create Cluster**: Click "Create Cluster"
3. **Choose Plan**: Select "Developer Tier" (Free)
4. **Configure**:
   - **Cluster Name**: `bookstore-cluster`
   - **Region**: `eu-central-1` (or your preferred region)
   - **Password**: Create a strong password
5. **Create**: Click "Create Cluster"

## 🔑 Step 2: Get Connection Details

1. **Cluster Overview**: Go to your cluster dashboard
2. **Connect**: Click "Connect" button
3. **Connection String**: Copy the connection string
4. **Format**: It should look like:
   ```
   mysql://22gYCn4NgAaSE8F.root:<PASSWORD>@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/bookstore_management
   ```

## ⚙️ Step 3: Configure Environment

1. **Create .env file**:
   ```bash
   cp env.example .env
   ```

2. **Edit .env file** with your TiDB Cloud credentials:
   ```env
   # Option 1: Use connection string (recommended)
   DATABASE_URL=mysql://22gYCn4NgAaSE8F.root:your_actual_password@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/bookstore_management
   
   # Option 2: Use individual parameters
   # DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
   # DB_USER=22gYCn4NgAaSE8F.root
   # DB_PASSWORD=your_actual_password
   # DB_NAME=bookstore_management
   # DB_PORT=4000
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   
   # Server Configuration
   PORT=5000
   NODE_ENV=production
   
   # CORS Configuration
   CORS_ORIGIN=https://your-frontend-domain.com
   
   # Security
   BCRYPT_ROUNDS=12
   
   # Logging
   LOG_LEVEL=info
   ```

## 🗄️ Step 4: Initialize Database

1. **Install MySQL Client** (if you don't have it):
   ```bash
   # Windows (using Chocolatey)
   choco install mysql
   
   # macOS
   brew install mysql-client
   
   # Ubuntu/Debian
   sudo apt-get install mysql-client
   ```

2. **Run Database Setup**:
   ```bash
   # Connect to TiDB Cloud
   mysql -h gateway01.eu-central-1.prod.aws.tidbcloud.com -P 4000 -u 22gYCn4NgAaSE8F.root -p bookstore_management
   
   # Or run the setup script directly
   mysql -h gateway01.eu-central-1.prod.aws.tidbcloud.com -P 4000 -u 22gYCn4NgAaSE8F.root -p < setup_mysql_database.sql
   ```

3. **Verify Tables**:
   ```sql
   USE bookstore_management;
   SHOW TABLES;
   ```

## 🧪 Step 5: Test Connection

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Check logs** for successful connection:
   ```
   ✅ TiDB Cloud database connected successfully
   ✅ Database connection successful to: gateway01.eu-central-1.prod.aws.tidbcloud.com
   ✅ Test query successful: { test: 1, timestamp: '2024-01-01T12:00:00.000Z' }
   ```

3. **Test endpoints**:
   - Health check: `GET /mysql-health`
   - API health: `GET /api/health`
   - Test endpoint: `GET /test`

## 🚀 Step 6: Deploy to Production

### Option A: Render (Recommended)

1. **Connect Repository**: Link your Git repository to Render
2. **Environment Variables**: Add your `.env` variables in Render dashboard
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Deploy**: Click "Deploy"

### Option B: Railway

1. **Connect Repository**: Link your Git repository to Railway
2. **Environment Variables**: Add your `.env` variables
3. **Deploy**: Railway will auto-deploy on push

### Option C: Heroku

1. **Create App**: `heroku create your-app-name`
2. **Add Variables**: `heroku config:set DATABASE_URL=your_tidb_connection_string`
3. **Deploy**: `git push heroku main`

## 🔍 Monitoring & Maintenance

### TiDB Cloud Dashboard

1. **Metrics**: Monitor CPU, memory, and storage usage
2. **Logs**: View database logs and queries
3. **Alerts**: Set up notifications for issues
4. **Backups**: Automatic daily backups (free tier)

### Application Monitoring

1. **Health Checks**: Regular database connectivity tests
2. **Logs**: Monitor application logs for errors
3. **Performance**: Track query response times

## 🆘 Troubleshooting

### Connection Issues

1. **Check Credentials**: Verify username, password, and host
2. **Network**: Ensure your IP is whitelisted (if required)
3. **SSL**: TiDB Cloud requires SSL connections
4. **Port**: Default port is 4000, not 3306

### Performance Issues

1. **Connection Pool**: Reduced to 5 connections for free tier
2. **Query Optimization**: Use indexes and limit result sets
3. **Caching**: Implement Redis for frequently accessed data

### Common Errors

```
ER_ACCESS_DENIED_ERROR: Access denied for user
→ Check username and password

ECONNREFUSED: Connection refused
→ Check host and port

ER_BAD_DB_ERROR: Unknown database
→ Database doesn't exist, run setup script
```

## 💰 Cost Optimization

### Free Tier Limits

- **Storage**: 1GB
- **Connections**: 5 concurrent connections
- **Backups**: Daily backups included
- **Support**: Community support

### Upgrade Considerations

- **Storage**: $0.25/GB/month after 1GB
- **Connections**: $0.10/connection/month after 5
- **Regions**: Additional regions available

## 🔐 Security Best Practices

1. **Strong Passwords**: Use complex, unique passwords
2. **Environment Variables**: Never commit credentials to Git
3. **SSL**: Always use SSL connections
4. **IP Whitelisting**: Restrict access to known IPs
5. **Regular Updates**: Keep dependencies updated

## 📚 Additional Resources

- [TiDB Cloud Documentation](https://docs.pingcap.com/tidbcloud/)
- [MySQL Compatibility Guide](https://docs.pingcap.com/tidb/stable/mysql-compatibility)
- [Connection Pooling Best Practices](https://docs.pingcap.com/tidb/stable/connection-pooling)
- [Performance Tuning](https://docs.pingcap.com/tidb/stable/performance-tuning)

## 🎯 Next Steps

1. **Test Locally**: Ensure everything works with TiDB Cloud
2. **Deploy**: Choose your preferred hosting platform
3. **Monitor**: Set up monitoring and alerts
4. **Scale**: Upgrade plan as needed

Your BookStore backend is now ready for TiDB Cloud deployment! 🚀 
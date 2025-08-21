# Environment Variables Setup Guide

This guide explains how to configure your `.env` file for both local development and Render deployment.

## 📁 Creating Your .env File

1. **Copy the example file:**
   ```bash
   cp env.example .env
   ```

2. **Edit the .env file with your actual values**

## 🔧 Local Development Configuration

### Basic .env file for local development:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_postgres_password
DB_NAME=bookstore_management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_characters

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration (for local development)
CORS_ORIGIN=http://localhost:3000

# Security
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=debug
```

## 🚀 Render Production Configuration

### Environment variables for Render deployment:

```env
# Database Configuration
DB_HOST=your-database-host.render.com
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=bookstore_management

# JWT Configuration
JWT_SECRET=your_very_long_and_random_secret_key_at_least_32_characters_long

# Server Configuration
PORT=10000
NODE_ENV=production

# CORS Configuration (for production)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Security
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
```

## 📋 Environment Variables Explained

### Database Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database server hostname | `localhost` (local) or `your-db.render.com` (Render) |
| `DB_USER` | Database username | `root` (local) or `your_db_user` (Render) |
| `DB_PASSWORD` | Database password | Your PostgreSQL password |
| `DB_NAME` | Database name | `bookstore_management` |

### JWT Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | Generate a random 32+ character string |

### Server Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` (local) or `10000` (Render) |
| `NODE_ENV` | Environment mode | `development` (local) or `production` (Render) |

### CORS Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `CORS_ORIGIN` | Allowed frontend domains | `http://localhost:3000` (local) or `https://yourdomain.com` (Render) |

### Security Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` (recommended) |

### Logging Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging level | `debug` (local) or `info` (production) |

## 🔐 Security Best Practices

### 1. Generate a Strong JWT Secret
```bash
# Generate a secure random string (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Use Strong Database Passwords
- At least 12 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Avoid common words or patterns

### 3. Configure CORS Properly
- **Local Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com,https://www.yourdomain.com`
- **Multiple Domains**: Separate with commas

## 🗄️ Database Setup Examples

### Local PostgreSQL Setup
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_postgres_password
DB_NAME=bookstore_management
```

### Render PostgreSQL Setup
```env
DB_HOST=your-postgres-service.onrender.com
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=bookstore_management
```

### External PostgreSQL Setup
```env
DB_HOST=your-postgres-server.com
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=bookstore_management
```

## 🔧 Environment-Specific Configurations

### Development (.env)
```env
NODE_ENV=development
PORT=5000
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
```

### Production (Render)
```env
NODE_ENV=production
PORT=10000
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
```

## ✅ Validation Checklist

Before deploying, ensure:

- [ ] `DB_HOST` points to your database server
- [ ] `DB_USER` and `DB_PASSWORD` are correct
- [ ] `DB_NAME` exists in your database
- [ ] `JWT_SECRET` is at least 32 characters long
- [ ] `CORS_ORIGIN` includes your frontend domain
- [ ] `NODE_ENV` is set to `production` for Render
- [ ] `PORT` is set to `10000` for Render

## 🚨 Common Issues

### Database Connection Errors
- Verify database credentials
- Ensure database server is running
- Check if database exists
- Verify network connectivity

### JWT Authentication Errors
- Ensure JWT_SECRET is set
- Check if JWT_SECRET is long enough
- Verify JWT_SECRET is consistent across deployments

### CORS Errors
- Check CORS_ORIGIN includes your frontend domain
- Ensure protocol (http/https) matches
- Verify domain spelling and subdomains

## 📞 Testing Your Configuration

### Test Database Connection
```bash
# Your app will test this automatically on startup
# Look for "✅ Database connected successfully" in logs
```

### Test JWT Secret
```bash
# The app will use this automatically
# No manual testing needed
```

### Test CORS
```bash
# Test from your frontend application
# Should allow requests from configured domains
```

---

**Remember**: Never commit your `.env` file to version control! It's already in `.gitignore` to prevent this. 
# 🚀 Render Deployment Checklist

## ✅ **Pre-Deployment Setup**

### **1. Environment Variables (CRITICAL)**
Make sure these are set in your Render backend service:

```bash
# Database Configuration
NODE_ENV=production
PORT=10000
DB_HOST=your-postgres-database-host.render.com
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=5432

# CORS Configuration
CORS_ORIGIN=https://bookstorefrontend-yrgv.onrender.com

# Security
JWT_SECRET=your_secure_jwt_secret_here
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
```

### **2. Database Setup**
- [ ] PostgreSQL database created on Render
- [ ] Database credentials copied to environment variables
- [ ] Database setup script run (`setup_postgres_database.sql`)

## 🔧 **Deployment Steps**

### **Step 1: Deploy Backend**
1. [ ] Push code changes to Git repository
2. [ ] Wait for Render auto-deployment
3. [ ] Check deployment logs for errors

### **Step 2: Test Backend Endpoints**
Test these endpoints in order:

1. **Basic Test** (no database required):
   ```
   https://bookstorebackend-0n75.onrender.com/test
   ```

2. **CORS Test**:
   ```
   https://bookstorebackend-0n75.onrender.com/cors-test
   ```

3. **Health Check**:
   ```
   https://bookstorebackend-0n75.onrender.com/api/health
   ```

4. **Database Health**:
   ```
   https://bookstorebackend-0n75.onrender.com/db-health
   ```

### **Step 3: Check Logs**
In Render dashboard:
- [ ] Check **Logs** tab for errors
- [ ] Look for database connection messages
- [ ] Look for CORS debug messages

## 🐛 **Troubleshooting**

### **If Backend Returns 502 Bad Gateway:**

1. **Check Database Connection**:
   - Verify environment variables are correct
   - Check if database is running
   - Look for database connection errors in logs

2. **Check CORS Configuration**:
   - Verify `CORS_ORIGIN` includes your frontend URL
   - Look for CORS debug messages in logs

3. **Check Trust Proxy**:
   - App should now handle reverse proxies correctly
   - Look for request logging in console

### **If CORS Still Fails:**

1. **Verify Environment Variables**:
   ```bash
   CORS_ORIGIN=https://bookstorefrontend-yrgv.onrender.com
   ```

2. **Check Request Headers**:
   - Look for `x-forwarded-for` and `x-forwarded-proto` in logs
   - Verify origin header is being received

3. **Test with Simple Endpoint**:
   - Use `/test` endpoint first (no database required)
   - Then test `/cors-test` endpoint

## 🔍 **Expected Log Messages**

### **Successful Database Connection:**
```
✅ Database connection successful to: your-db-host.render.com
✅ PostgreSQL database connected successfully
```

### **Successful CORS Request:**
```
🔍 CORS Debug - Origin: https://bookstorefrontend-yrgv.onrender.com
🔍 CORS Debug - Origin allowed: https://bookstorefrontend-yrgv.onrender.com
```

### **Request Details:**
```
🔍 Request: {
  method: 'GET',
  url: '/api/health',
  origin: 'https://bookstorefrontend-yrgv.onrender.com',
  host: 'bookstorebackend-0n75.onrender.com'
}
```

## 🎯 **Success Criteria**

- [ ] Backend responds to basic requests
- [ ] CORS headers are properly sent
- [ ] Frontend can connect without CORS errors
- [ ] Database connection is stable
- [ ] Login functionality works

## 📞 **If Still Having Issues**

1. **Check Render Logs** for specific error messages
2. **Verify all environment variables** are set correctly
3. **Test database connection** using the `/db-health` endpoint
4. **Check CORS configuration** using the `/cors-test` endpoint

## 🔄 **After Successful Deployment**

1. **Remove debug logging** if desired
2. **Set LOG_LEVEL=info** for production
3. **Monitor logs** for any ongoing issues
4. **Test all frontend functionality** 
# Authentication Troubleshooting Guide

## Problem Analysis
Based on your frontend logs showing `{hasToken: false, hasUser: false, token: 'Missing', user: 'Missing'}`, the issue appears to be that authentication tokens and user data are not being properly stored or retrieved from sessionStorage.

## Recent Backend Improvements Made

### 1. Enhanced Authentication Endpoints
- **Added `/api/auth/verify`** - Verifies if a token is valid and returns user data
- **Added `/api/auth/logout`** - Proper logout endpoint
- **Added `/api/auth/refresh`** - Token refresh functionality
- **Improved `/api/auth/me`** - Enhanced user data retrieval

### 2. Better Error Handling
- Enhanced authentication middleware with detailed error messages
- Added comprehensive logging for debugging
- Better CORS configuration

### 3. New Debugging Endpoints
- **`/api/auth/status`** - Comprehensive authentication status for debugging
- Enhanced logging in login process

## Testing Steps

### Step 1: Verify Backend is Running
1. Make sure your `.env` file exists and contains:
   ```
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   # ... other database config
   ```

2. Start your backend:
   ```bash
   npm run dev
   ```

### Step 2: Test Authentication Endpoints

#### Test 1: Check Server Health
```bash
curl http://localhost:5000/api/health
```

#### Test 2: Check Authentication Status (with no token)
```bash
curl http://localhost:5000/api/auth/status
```

#### Test 3: Test Login (replace with actual credentials)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

#### Test 4: Test Token Verification (use token from login response)
```bash
curl http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 3: Frontend Integration

#### Update Your Frontend Authentication Logic

1. **Login Function** - Make sure it stores both token and user data:
```javascript
const login = async (username, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store both token and user data
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('✅ Login successful, token stored:', {
        tokenLength: data.token.length,
        user: data.user
      });
      
      return data;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};
```

2. **Token Verification Function**:
```javascript
const verifyToken = async () => {
  const token = sessionStorage.getItem('token');
  
  if (!token) {
    console.log('🔍 No token found in sessionStorage');
    return false;
  }
  
  try {
    const response = await fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token verification successful:', data);
      return true;
    } else {
      console.log('❌ Token verification failed');
      // Clear invalid token
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return false;
    }
  } catch (error) {
    console.error('❌ Token verification error:', error);
    return false;
  }
};
```

3. **Authentication Status Check**:
```javascript
const getAuthStatus = () => {
  const token = sessionStorage.getItem('token');
  const userStr = sessionStorage.getItem('user');
  
  const status = {
    hasToken: !!token,
    hasUser: !!userStr,
    token: token ? token.substring(0, 20) + '...' : 'Missing',
    user: userStr ? 'Present' : 'Missing'
  };
  
  console.log('🔍 Auth Status:', status);
  
  return {
    isAuthenticated: !!token && !!userStr,
    user: userStr ? JSON.parse(userStr) : null,
    token: token
  };
};
```

## Common Issues and Solutions

### Issue 1: CORS Errors
- **Symptom**: Network errors or CORS policy violations
- **Solution**: Ensure your frontend URL is in the CORS_ORIGIN environment variable

### Issue 2: JWT_SECRET Missing
- **Symptom**: "Server configuration error" on login
- **Solution**: Add JWT_SECRET to your .env file

### Issue 3: Database Connection Issues
- **Symptom**: Database connection errors
- **Solution**: Check your database credentials and connection

### Issue 4: Token Not Persisting
- **Symptom**: Token exists after login but disappears on page refresh
- **Solution**: 
  - Check if sessionStorage is being cleared somewhere
  - Consider using localStorage instead of sessionStorage
  - Verify the token is being stored after successful login

### Issue 5: Middleware Conflicts
- **Symptom**: Authentication middleware errors
- **Solution**: Make sure all route files are using the updated import: `const { authenticateToken } = require('../middleware/auth');`

## Debug Commands

### Check Authentication Status (Frontend Console)
```javascript
// Run this in your browser's console
console.log('Token:', sessionStorage.getItem('token'));
console.log('User:', sessionStorage.getItem('user'));

// Test authentication status endpoint
fetch('/api/auth/status')
  .then(r => r.json())
  .then(console.log);
```

### Backend Debug Logs
Look for these log patterns in your backend console:
- `🔍 Authentication check` - Shows when auth middleware is called
- `🔍 Login attempt` - Shows login attempts
- `🔍 Login successful` - Confirms successful authentication

## Next Steps

1. **Test the backend endpoints** using the curl commands above
2. **Update your frontend code** with the improved authentication functions
3. **Check browser console** for any JavaScript errors
4. **Verify sessionStorage** is working correctly
5. **Test the flow**: Login → Store token → Verify token → Access protected routes

If issues persist, check:
- Browser network tab for actual HTTP requests/responses
- Backend console logs for detailed error messages
- CORS headers in network responses
- Token format and content
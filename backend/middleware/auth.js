const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  console.log('🔍 Authentication check - Headers:', {
    authorization: req.headers['authorization'],
    origin: req.headers.origin,
    'user-agent': req.headers['user-agent']
  });
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('🔍 Authentication failed - No token provided');
    return res.status(401).json({ 
      message: 'No token provided',
      error: 'MISSING_TOKEN',
      authenticated: false
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('🔍 Authentication failed - JWT_SECRET not configured');
    return res.status(500).json({ 
      message: 'Server configuration error',
      error: 'JWT_SECRET_MISSING'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('🔍 Authentication failed - Invalid token:', err.message);
      return res.status(403).json({ 
        message: 'Invalid token',
        error: 'INVALID_TOKEN',
        authenticated: false,
        details: err.message
      });
    }
    
    console.log('🔍 Authentication successful - User:', { id: user.id, username: user.username, role: user.role });
    req.user = user;
    next();
  });
}

// Optional authentication - doesn't fail if no token
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    req.user = null;
    return next();
  }

  if (!process.env.JWT_SECRET) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
}

module.exports = { 
  authenticateToken,
  optionalAuth
}; 
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message: message || 'Please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many API requests from this IP'
);

// Auth endpoints rate limiter (more strict)
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts from this IP'
);

// Configure CORS for production
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🔍 CORS Debug - Origin:', origin);
    console.log('🔍 CORS Debug - CORS_ORIGIN env:', process.env.CORS_ORIGIN);
    
    // Default allowed origins
    const defaultOrigins = [
      'http://localhost:3000',
      'https://bookstorefrontend-yrgv.onrender.com'
    ];
    
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : defaultOrigins;
    
    console.log('🔍 CORS Debug - Allowed origins:', allowedOrigins);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('🔍 CORS Debug - No origin, allowing request');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('🔍 CORS Debug - Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('🔍 CORS Debug - Origin blocked:', origin);
      console.log('🔍 CORS Debug - Allowed origins were:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  corsOptions,
  securityHeaders
}; 
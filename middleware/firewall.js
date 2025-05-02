const rateLimit = require('express-rate-limit');
// Temporarily comment out express-validator
// const { body, validationResult } = require('express-validator');

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP per 15 minutes
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per IP per hour
  message: 'Too many registration attempts from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per 15 minutes
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Temporarily comment out validation middleware
/*
// Input validation for user registration
const validateRegistration = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('displayName').trim().isLength({ min: 2 }).withMessage('Display name must be at least 2 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Input validation for login
const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
*/

// Simple placeholder validation middleware
const validateRegistration = [(req, res, next) => next()];
const validateLogin = [(req, res, next) => next()];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // In production, you would list your allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'https://quizora.com',
      'https://www.quizora.com'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

module.exports = {
  loginLimiter,
  registerLimiter,
  apiLimiter,
  validateRegistration,
  validateLogin,
  corsOptions
}; 

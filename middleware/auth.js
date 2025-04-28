const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    // Check for test user token (for testing purposes only)
    if (authHeader === 'Bearer test-token') {
      // Set up test user data
      req.user = {
        uid: 'test-user-id',
        email: 'test@quizora.com',
        displayName: 'Test User'
      };
      return next();
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Invalid token format.' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists in Firebase
    try {
      const userRecord = await admin.auth().getUser(decoded.uid);
      
      // Add user data to request object
      req.user = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      };
      
      next();
    } catch (error) {
      console.error('Error verifying user:', error);
      return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Authentication failed. Token expired.' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Authentication failed. Invalid token.' });
    }
    
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

// Middleware to check if user is admin
const adminMiddleware = async (req, res, next) => {
  try {
    // First run the auth middleware
    authMiddleware(req, res, async () => {
      // Special case for test user - grant admin access
      if (req.user && req.user.uid === 'test-user-id') {
        return next();
      }
      
      // Check if user has admin role in Firestore
      const db = admin.firestore();
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      
      if (!userDoc.exists) {
        return res.status(403).json({ message: 'Access denied. User not found.' });
      }
      
      const userData = userDoc.data();
      
      if (!userData.roles || !userData.roles.includes('admin')) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      
      // User is admin, proceed
      next();
    });
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ message: 'Internal server error checking admin status.' });
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware
}; 

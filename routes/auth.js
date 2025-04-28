const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { loginLimiter } = require('../middleware/firewall');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, age } = req.body;
    
    // Validate inputs
    if (!email || !password || !displayName) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName
    });
    
    // Store additional user data in Firestore
    const db = admin.firestore();
    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      age: age || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        theme: 'light',
        notifications: true,
        language: 'en'
      }
    });
    
    // Create JWT token
    const token = jwt.sign(
      { uid: userRecord.uid, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        uid: userRecord.uid,
        email,
        displayName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    res.status(500).json({ message: 'Error creating user account' });
  }
});

// Login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Create JWT token
    const token = jwt.sign(
      { uid: userRecord.uid, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Get user data from Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    res.status(200).json({
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        ...userDoc.data()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from Firebase
    const userRecord = await admin.auth().getUser(decoded.uid);
    
    // Get user data from Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    res.status(200).json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        ...userDoc.data()
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// Google sign in
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verify the ID token from Google
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    
    // Check if user exists in Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      // Create new user in Firestore
      await db.collection('users').doc(uid).set({
        email,
        displayName: name,
        photoURL: picture,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        settings: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { uid, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      token,
      user: {
        uid,
        email,
        displayName: name,
        photoURL: picture,
        ...(userDoc.exists ? userDoc.data() : {})
      }
    });
  } catch (error) {
    console.error('Google sign in error:', error);
    res.status(401).json({ message: 'Failed to authenticate with Google' });
  }
});

module.exports = router; 

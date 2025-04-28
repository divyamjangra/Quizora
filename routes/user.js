const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { authMiddleware } = require('../middleware/auth');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    // Remove sensitive information
    delete userData.password;
    
    res.status(200).json({
      uid: req.user.uid,
      ...userData
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { displayName, age, bio, avatarUrl } = req.body;
    
    const db = admin.firestore();
    const userRef = db.collection('users').doc(req.user.uid);
    
    const updatedData = {};
    
    if (displayName) updatedData.displayName = displayName;
    if (age) updatedData.age = age;
    if (bio !== undefined) updatedData.bio = bio;
    if (avatarUrl) updatedData.avatarUrl = avatarUrl;
    updatedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await userRef.update(updatedData);
    
    // Update display name in Firebase Auth if changed
    if (displayName) {
      await admin.auth().updateUser(req.user.uid, {
        displayName
      });
    }
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      updates: updatedData
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});



// Get user settings
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    // Return settings or create default if doesn't exist
    const settings = userData.settings || {
      theme: 'light',
      notifications: true,
      language: 'en',
      soundEffects: true,
      privacyMode: false
    };
    
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { authMiddleware } = require('../middleware/auth');

// Get all quizzes (public ones)
router.get('/public', async (req, res) => {
  try {
    const db = admin.firestore();
    const quizzesSnapshot = await db.collection('quizzes')
      .where('isPublic', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();
    
    const quizzes = [];
    quizzesSnapshot.forEach(doc => {
      quizzes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error fetching public quizzes:', error);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
});

// Get a specific quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const db = admin.firestore();
    const quizDoc = await db.collection('quizzes').doc(req.params.id).get();
    
    if (!quizDoc.exists) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    const quizData = quizDoc.data();
    
    // Check if quiz is private and user is not the owner
    if (!quizData.isPublic && (!req.user || req.user.uid !== quizData.createdBy)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.status(200).json({
      id: quizDoc.id,
      ...quizData
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Failed to fetch quiz' });
  }
});

// Create a new quiz
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, questions, category, isPublic } = req.body;
    
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Invalid quiz data' });
    }
    
    const db = admin.firestore();
    const quizCode = generateQuizCode();
    
    const newQuiz = {
      title,
      description: description || '',
      questions,
      category: category || 'General',
      isPublic: isPublic || false,
      createdBy: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      playCount: 0,
      quizCode
    };
    
    const quizRef = await db.collection('quizzes').add(newQuiz);
    
    res.status(201).json({
      id: quizRef.id,
      quizCode,
      message: 'Quiz created successfully'
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Failed to create quiz' });
  }
});

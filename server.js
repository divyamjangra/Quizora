require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
// Temporarily comment out Firebase admin
// const admin = require('firebase-admin');
const { apiLimiter, corsOptions } = require('./middleware/firewall');

// Temporarily comment out Firebase initialization
/*
// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
*/

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Import routes - temporarily comment out routes that depend on Firebase
// const authRoutes = require('./routes/auth');
// const quizRoutes = require('./routes/quiz');
// const userRoutes = require('./routes/user');

// Middleware
app.use(cors(corsOptions));
// Disable helmet temporarily to avoid CSP issues
// app.use(helmet({
//  contentSecurityPolicy: false,  // Disable CSP for local development
// }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply rate limiting to API routes
// app.use('/api/', apiLimiter);

// Serve static files
app.use(express.static(path.join(__dirname, './')));

// Routes - temporarily comment out
// app.use('/api/auth', authRoutes);
// app.use('/api/quiz', quizRoutes);
// app.use('/api/user', userRoutes);

// Serve landing page for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Landing Page.html'));
});

// Define routes for specific HTML files
app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'auth.html'));
});

app.get('/multiplayer', (req, res) => {
  res.sendFile(path.join(__dirname, 'multiplayer.html'));
});

app.get('/trivia', (req, res) => {
  res.sendFile(path.join(__dirname, 'Trivia.html'));
});

// All other routes serve the landing page as fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Landing Page.html'));
});

// Socket.io connection handlers - temporarily minimized
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware - place this AFTER all routes
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send('Something broke! Please try again later.');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
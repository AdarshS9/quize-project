const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exams');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');

const app = express();
const PORT = process.env.PORT || 5000;

// Request logger for debugging (moved to top)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});

app.use(cors());
app.use(express.json());

// Initialize Database
initDb().catch(console.error);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);

app.get('/', (req, res) => {
  res.send('Online Quiz & Exam Platform API');
});

// Final 404 Handler for API
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Not Found: ${req.method} ${req.url}` });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (All interfaces)`);
});

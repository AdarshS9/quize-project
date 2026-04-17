const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { client } = require('../db');
const { authenticate, isAdmin } = require('../middlewares/auth');
const multer = require('multer');
const xlsx = require('xlsx');
const upload = multer({ dest: 'uploads/' });

router.use(authenticate, isAdmin);

// Admin Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const examsCount = await client.execute('SELECT COUNT(*) as count FROM exams');
    const studentsCount = await client.execute("SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT'");
    const submissionsCount = await client.execute("SELECT COUNT(*) as count FROM attempts WHERE status = 'SUBMITTED'");
    
    res.json({
      totalExams: examsCount.rows[0].count,
      totalStudents: studentsCount.rows[0].count,
      totalSubmissions: submissionsCount.rows[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Exam
router.post('/exams', async (req, res) => {
  const { title, description, duration, start_time, end_time, passing_score, assigned_to, published, questions } = req.body;
  const id = uuidv4();
  
  if (new Date(start_time) >= new Date(end_time)) {
    return res.status(400).json({ error: 'Start time must be before end time.' });
  }

  try {
    await client.execute({
      sql: 'INSERT INTO exams (id, title, description, duration, start_time, end_time, passing_score, assigned_to, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [id, title, description, duration, start_time, end_time, passing_score || 0, assigned_to || 'all', 'published', req.user.id]
    });

    // If questions were sent in the same request, add them
    if (questions && Array.isArray(questions)) {
      for (const q of questions) {
        const qId = uuidv4();
        await client.execute({
          sql: 'INSERT INTO questions (id, exam_id, type, text, options, correct_answer, explanation, marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          args: [qId, id, q.type, q.text, JSON.stringify(q.options), q.correct_answer, q.explanation, q.marks]
        });
      }
    }

    res.status(201).json({ id, message: 'Exam created and published' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Questions to Exam
router.post('/exams/:id/questions', async (req, res) => {
  const { questions } = req.body; // Array of questions
  const examId = req.params.id;

  try {
    for (const q of questions) {
      const qId = uuidv4();
      await client.execute({
        sql: 'INSERT INTO questions (id, exam_id, type, text, options, correct_answer, explanation, marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [qId, examId, q.type, q.text, JSON.stringify(q.options), q.correct_answer, q.explanation, q.marks]
      });
    }
    res.status(201).json({ message: 'Questions added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Students List
router.get('/students', async (req, res) => {
  try {
    const result = await client.execute("SELECT id, name, email FROM users WHERE role = 'STUDENT'");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Grant Retake
router.post('/attempts/:id/retake', async (req, res) => {
  try {
    await client.execute({
      sql: 'UPDATE attempts SET retake_allowed = 1 WHERE id = ?',
      args: [req.params.id]
    });
    res.json({ message: 'Retake granted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Attempts for Admin
router.get('/attempts', async (req, res) => {
  try {
    const result = await client.execute(`
      SELECT a.*, u.name, u.email, e.title as exam_title, e.passing_score
      FROM attempts a
      JOIN users u ON a.user_id = u.id
      JOIN exams e ON a.exam_id = e.id
      WHERE a.status = 'SUBMITTED'
      ORDER BY a.submit_time DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Import Exam Questions from Excel
router.post('/exams/import', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    // Map Excel rows to internal question format
    const questions = data.map(row => ({
      type: row.type || row.Type || 'MCQ',
      text: row.text || row.Question || '',
      options: row.options ? (typeof row.options === 'string' ? row.options.split('|') : row.options) : (row.type === 'MCQ' ? ['', '', '', ''] : null),
      correct_answer: String(row.correct_answer || row.Answer || ''),
      explanation: row.explanation || row.Explanation || '',
      marks: parseInt(row.marks || row.Marks) || 1
    }));

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Factory Reset (Delete everything except admins)
router.post('/reset-all', async (req, res) => {
  try {
    await client.execute('DELETE FROM answers');
    await client.execute('DELETE FROM attempts');
    await client.execute('DELETE FROM questions');
    await client.execute('DELETE FROM exams');
    await client.execute("DELETE FROM users WHERE role = 'STUDENT'");
    res.json({ message: 'Platform data reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


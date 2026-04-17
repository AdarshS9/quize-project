const express = require('express');
const router = express.Router();
const { client } = require('../db');
const { authenticate } = require('../middlewares/auth');
const { v4: uuidv4 } = require('uuid');
const { isAdmin } = require('../middlewares/auth');

// Get exams (Published for students, All for Admins)
router.get('/', authenticate, async (req, res) => {
  try {
    let sql = `
      SELECT e.*, 
      (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as question_count,
      (SELECT status FROM attempts a WHERE a.exam_id = e.id AND a.user_id = ?) as user_attempt_status
      FROM exams e 
    `;
    
    const args = [req.user.id];
    
    if (req.user.role !== 'ADMIN') {
      sql += " WHERE status = 'published'";
    }
    
    const result = await client.execute({ sql, args });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create & Publish Exam (Admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  const { title, description, subject, date, duration, start_time, end_time, total_marks, questions } = req.body;
  const id = uuidv4();
  
  try {
    await client.execute({
      sql: 'INSERT INTO exams ("id", "title", "description", "subject", "date", "duration", "start_time", "end_time", "total_marks", "status", "created_by") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [id, title, description, subject, date, duration, start_time, end_time, total_marks || 0, 'published', req.user.id]
    });

    if (questions && Array.isArray(questions)) {
      for (const q of questions) {
        const qId = uuidv4();
        await client.execute({
          sql: 'INSERT INTO questions (id, exam_id, type, text, options, correct_answer, marks) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [qId, id, q.type || 'MCQ', q.text, JSON.stringify(q.options), q.correct_answer, q.marks || 1]
        });
      }
    }

    res.status(201).json({ id, message: 'Exam created and published' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific exam details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const examResult = await client.execute({
      sql: 'SELECT * FROM exams WHERE id = ?',
      args: [req.params.id]
    });
    
    if (examResult.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });
    
    const exam = examResult.rows[0];

    const questionsResult = await client.execute({
      sql: 'SELECT * FROM questions WHERE exam_id = ?',
      args: [req.params.id]
    });

    exam.questions = questionsResult.rows.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Exam (Admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  const { title, description, subject, date, duration, start_time, end_time, total_marks, questions } = req.body;
  const examId = req.params.id;
  
  try {
    // 1. Update Exam Metadata
    await client.execute({
      sql: 'UPDATE exams SET "title" = ?, "description" = ?, "subject" = ?, "date" = ?, "duration" = ?, "start_time" = ?, "end_time" = ?, "total_marks" = ? WHERE "id" = ?',
      args: [title, description, subject, date, duration, start_time, end_time, total_marks || 0, examId]
    });

    // 2. Refresh Questions (Delete and re-insert)
    await client.execute({
      sql: 'DELETE FROM questions WHERE exam_id = ?',
      args: [examId]
    });

    if (questions && Array.isArray(questions)) {
      for (const q of questions) {
        const qId = uuidv4();
        await client.execute({
          sql: 'INSERT INTO questions (id, exam_id, type, text, options, correct_answer, marks) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [qId, examId, q.type || 'MCQ', q.text, JSON.stringify(q.options), q.correct_answer, q.marks || 1]
        });
      }
    }

    res.json({ message: 'Exam updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Exam (Admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await client.execute({
      sql: 'DELETE FROM exams WHERE id = ?',
      args: [req.params.id]
    });
    res.json({ message: 'Exam deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

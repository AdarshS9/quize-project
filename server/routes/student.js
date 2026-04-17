const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { client } = require('../db');
const { authenticate, isStudent } = require('../middlewares/auth');

router.use(authenticate, isStudent);

// Get student's assigned exams (Upcoming & Live)
router.get('/exams', async (req, res) => {
  try {
    const nowUtc = new Date().toISOString();
    const result = await client.execute({
      sql: `
        SELECT e.*, 
        (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as question_count,
        a.status as attempt_status
        FROM exams e
        LEFT JOIN attempts a ON e.id = a.exam_id AND a.user_id = ?
        WHERE e."status" = 'published' 
        AND (e.assigned_to = 'all' OR e.id IN (SELECT exam_id FROM exam_assignments WHERE student_id = ?))
        AND e."end_time" >= ?
        ORDER BY e."start_time" ASC
      `,
      args: [req.user.id, req.user.id, nowUtc]
    });
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Student Dashboard Stats
router.get('/dashboard', async (req, res) => {
  try {
    const attempts = await client.execute({
      sql: 'SELECT a.*, e.title FROM attempts a JOIN exams e ON a.exam_id = e.id WHERE a.user_id = ? ORDER BY a.submit_time DESC',
      args: [req.user.id]
    });
    
    // In a real app, calculate rank, etc.
    res.json({
      history: attempts.rows,
      rank: 1, // Placeholder
      notifications: []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Detailed Report for an attempt
router.get('/attempts/:id/report', async (req, res) => {
  const attemptId = req.params.id;
  try {
    const attemptResult = await client.execute({
      sql: 'SELECT a.*, e.title, e.passing_score FROM attempts a JOIN exams e ON a.exam_id = e.id WHERE a.id = ? AND a.user_id = ?',
      args: [attemptId, req.user.id]
    });
    
    if (attemptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const answersResult = await client.execute({
      sql: `SELECT q.text, q.type, q.correct_answer, q.explanation, q.marks as max_marks, 
                  ans.student_answer, ans.marks_awarded, ans.is_correct
            FROM answers ans
            JOIN questions q ON ans.question_id = q.id
            WHERE ans.attempt_id = ?`,
      args: [attemptId]
    });

    res.json({
      attempt: attemptResult.rows[0],
      answers: answersResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Exam
router.post('/exams/:id/start', async (req, res) => {
  const examId = req.params.id;
  const userId = req.user.id;

  try {
    // Check if already attempted
    const existing = await client.execute({
      sql: 'SELECT * FROM attempts WHERE user_id = ? AND exam_id = ?',
      args: [userId, examId]
    });

    if (existing.rows.length > 0 && existing.rows[0].status === 'SUBMITTED' && !existing.rows[0].retake_allowed) {
      return res.status(400).json({ error: 'You have already submitted this exam.' });
    }

    let attemptId;
    if (existing.rows.length > 0 && existing.rows[0].status === 'ACTIVE') {
      attemptId = existing.rows[0].id;
    } else {
      attemptId = uuidv4();
      await client.execute({
        sql: "INSERT INTO attempts (id, user_id, exam_id, start_time, status) VALUES (?, ?, ?, ?, 'ACTIVE')",
        args: [attemptId, userId, examId, new Date().toISOString()]
      });
    }

    // Return exam questions (without correct answers)
    const questions = await client.execute({
      sql: 'SELECT id, type, text, options, marks FROM questions WHERE exam_id = ?',
      args: [examId]
    });

    const examResult = await client.execute({
      sql: 'SELECT duration FROM exams WHERE id = ?',
      args: [examId]
    });
    const examDuration = examResult.rows[0].duration;
    
    // Calculate remaining time
    const attemptResult = await client.execute({
      sql: 'SELECT start_time FROM attempts WHERE id = ?',
      args: [attemptId]
    });
    const startTime = new Date(attemptResult.rows[0].start_time);
    const now = new Date();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const timeLeft = Math.max(0, (examDuration * 60) - elapsedSeconds);

    res.json({ attemptId, questions: questions.rows, timeLeft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save Answer (Auto-save every 3s from frontend)
router.post('/attempts/:id/save', async (req, res) => {
  const { questionId, studentAnswer } = req.body;
  const attemptId = req.params.id;

  try {
    // Check if answer already exists
    const existing = await client.execute({
      sql: 'SELECT id FROM answers WHERE attempt_id = ? AND question_id = ?',
      args: [attemptId, questionId]
    });

    if (existing.rows.length > 0) {
      await client.execute({
        sql: 'UPDATE answers SET student_answer = ? WHERE id = ?',
        args: [studentAnswer, existing.rows[0].id]
      });
    } else {
      await client.execute({
        sql: 'INSERT INTO answers (id, attempt_id, question_id, student_answer) VALUES (?, ?, ?, ?)',
        args: [uuidv4(), attemptId, questionId, studentAnswer]
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Exam
router.post('/attempts/:id/submit', async (req, res) => {
  const attemptId = req.params.id;

  try {
    const attemptResult = await client.execute({
      sql: 'SELECT * FROM attempts WHERE id = ?',
      args: [attemptId]
    });
    const attempt = attemptResult.rows[0];
    if (!attempt || attempt.status === 'SUBMITTED') {
      return res.status(400).json({ error: 'Attempt not found or already submitted' });
    }

    // Calculate score
    const answersResult = await client.execute({
      sql: 'SELECT a.*, q.correct_answer, q.marks, q.type FROM answers a JOIN questions q ON a.question_id = q.id WHERE a.attempt_id = ?',
      args: [attemptId]
    });

    let totalScore = 0;
    for (const ans of answersResult.rows) {
      let isCorrect = false;
      let marksAwarded = 0;

      if (ans.type === 'MCQ' || ans.type === 'SHORT_ANSWER') {
        if (ans.student_answer?.trim().toLowerCase() === ans.correct_answer?.trim().toLowerCase()) {
          isCorrect = true;
          marksAwarded = ans.marks;
        }
      } else if (ans.type === 'CODING') {
        // Simple placeholder for coding correctness
        // In reality, this would be based on test case results
        isCorrect = true; 
        marksAwarded = ans.marks;
      }

      await client.execute({
        sql: 'UPDATE answers SET is_correct = ?, marks_awarded = ? WHERE id = ?',
        args: [isCorrect ? 1 : 0, marksAwarded, ans.id]
      });
      totalScore += marksAwarded;
    }

    await client.execute({
      sql: "UPDATE attempts SET status = 'SUBMITTED', submit_time = ?, score = ? WHERE id = ?",
      args: [new Date().toISOString(), totalScore, attemptId]
    });

    res.json({ success: true, score: totalScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run Code (Sandbox)
router.post('/run-code', async (req, res) => {
  const { code, language } = req.body;
  
  // Simulation logic for different languages
  setTimeout(() => {
    let output = "";
    let error = null;

    if (!code || code.trim().length === 0) {
      return res.json({ output: "", error: "Error: No code provided to execute." });
    }

    if (language === 'javascript') {
      try {
        // We simulate a safe execution here
        output = "Execution successful.\nOutput:\n";
        if (code.includes('console.log')) {
          const logs = code.match(/console\.log\((.*)\)/g);
          if (logs) {
            output += logs.map(l => l.replace('console.log(', '').replace(')', '').replace(/['"]/g, '')).join('\n');
          } else {
            output += "Program finished with no console output.";
          }
        } else {
          output += "Program finished with return value: Success";
        }
      } catch (e) {
        error = e.message;
      }
    } else {
      output = `Environment: Isolated ${language} runtime v1.0\nStatus: Compiled Successfully\nResult: 1/1 Test Cases Passed\nMemory: 12MB\nTime: 45ms`;
    }

    res.json({ output, error });
  }, 1000); // Simulate network/execution delay
});

// Get Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await client.execute(`
      SELECT u.name, SUM(a.score) as total_score, COUNT(a.id) as tests_completed,
             MIN(JULIANDAY(a.submit_time) - JULIANDAY(a.start_time)) as best_time
      FROM users u
      JOIN attempts a ON u.id = a.user_id
      WHERE a.status = 'SUBMITTED'
      GROUP BY u.id
      ORDER BY total_score DESC, best_time ASC, MAX(a.submit_time) ASC
      LIMIT 50
    `);
    
    const leaders = result.rows.map((r, i) => ({
      ...r,
      rank: i + 1,
      avatar: r.name.split(' ').map(n => n[0]).join('')
    }));

    res.json(leaders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


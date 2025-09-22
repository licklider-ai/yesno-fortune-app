// api/server.js
const express = require('express');
const { Pool } = require('pg');

// ---------- Middleware ----------
const corsAll = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
};

const app = express();
app.use(corsAll);
app.use(express.json({ limit: '1mb' }));

// ---------- DB ----------
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.connect().then(c => c.release()).catch(e => console.error('DB connect error', e));

// ---------- Routes ----------

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// POST /api/logs
// body: { quizId|quiz_id, questionId|question_id, answer: "YES"|"NO" }
app.post('/api/logs', async (req, res) => {
  try {
    const b = req.body || {};
    const quizId = b.quizId ?? b.quiz_id;
    const questionId = b.questionId ?? b.question_id;
    const answer = String(b.answer || '').toUpperCase();

    if (!quizId || !questionId || !['YES', 'NO'].includes(answer)) {
      return res.status(400).json({ error: 'invalid payload' });
    }

    await pool.query(
      'INSERT INTO log_entries (quiz_id, question_id, answer) VALUES ($1,$2,$3)',
      [quizId, questionId, answer]
    );
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error('POST /api/logs failed', e);
    return res.status(500).json({ error: 'internal error' });
  }
});

// （任意）診断完了ログ：必要になったら別テーブルにINSERTする運用に変更可
app.post('/api/logs/complete', async (req, res) => {
  const b = req.body || {};
  const quizId = b.quizId ?? b.quiz_id;
  if (!quizId) return res.status(400).json({ error: 'quizId required' });
  // まずは何もしないで201を返す（必要ならテーブル追加してINSERT）
  return res.status(201).json({ ok: true });
});

// 集計
app.get('/api/stats/summary', async (_req, res) => {
  try {
    const quizzes = await pool.query(
      "SELECT quiz_id, COUNT(*)::int AS count FROM log_entries GROUP BY quiz_id ORDER BY quiz_id"
    );
    const questions = await pool.query(
      `SELECT question_id,
              SUM(CASE WHEN answer='YES' THEN 1 ELSE 0 END)::int AS yes,
              SUM(CASE WHEN answer='NO'  THEN 1 ELSE 0 END)::int AS no
         FROM log_entries
        GROUP BY question_id
        ORDER BY question_id`
    );
    const quizzesObj = {};
    quizzes.rows.forEach(r => { quizzesObj[r.quiz_id] = r.count; });
    const questionsObj = {};
    questions.rows.forEach(r => { questionsObj[r.question_id] = { yes: r.yes, no: r.no }; });
    res.json({ quizzes: quizzesObj, questions: questionsObj });
  } catch (e) {
    console.error('GET /api/stats/summary failed', e);
    res.status(500).json({ error: 'internal error' });
  }
});

// ---------- Start ----------
const port = process.env.PORT || 8080;
app.listen(port, () => console.log('API listening on :' + port));

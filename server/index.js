const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  user: process.env.POSTGRES_USER || 'app',
  password: process.env.POSTGRES_PASSWORD || 'app',
  database: process.env.POSTGRES_DB || 'yesno',
  port: Number(process.env.POSTGRES_PORT || 5432),
});

async function waitForDB(retries = 60, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try { await pool.query('SELECT 1'); return; }
    catch { console.log(`[DB] not ready (${i+1}/${retries})`); await new Promise(r=>setTimeout(r, delay)); }
  }
  throw new Error('DB never became ready');
}

async function init() {
  await waitForDB();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS log_entries (
      id BIGSERIAL PRIMARY KEY,
      quiz_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      answer TEXT NOT NULL CHECK (answer IN ('YES','NO')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS totals_quiz (
      quiz_id TEXT PRIMARY KEY,
      yes_count BIGINT NOT NULL DEFAULT 0,
      no_count BIGINT NOT NULL DEFAULT 0
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS totals_question (
      quiz_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      yes_count BIGINT NOT NULL DEFAULT 0,
      no_count BIGINT NOT NULL DEFAULT 0,
      PRIMARY KEY (quiz_id, question_id)
    );
  `);
}

app.post('/api/logs', async (req, res) => {
  try {
    const { quizId, questionId, answer } = req.body || {};
    if (!quizId || !questionId || !['YES','NO'].includes(answer)) return res.status(400).json({ error: 'Invalid payload' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO log_entries (quiz_id, question_id, answer) VALUES ($1,$2,$3)', [quizId, questionId, answer]);
      const yes = answer === 'YES' ? 1 : 0; const no = answer === 'NO' ? 1 : 0;
      await client.query(`INSERT INTO totals_quiz (quiz_id, yes_count, no_count)
        VALUES ($1,$2,$3)
        ON CONFLICT (quiz_id) DO UPDATE SET
          yes_count = totals_quiz.yes_count + EXCLUDED.yes_count,
          no_count  = totals_quiz.no_count  + EXCLUDED.no_count`,
        [quizId, yes, no]);
      await client.query(`INSERT INTO totals_question (quiz_id, question_id, yes_count, no_count)
        VALUES ($1,$2,$3,$4)
        ON CONFLICT (quiz_id, question_id) DO UPDATE SET
          yes_count = totals_question.yes_count + EXCLUDED.yes_count,
          no_count  = totals_question.no_count  + EXCLUDED.no_count`,
        [quizId, questionId, yes, no]);
      await client.query('COMMIT');
    } catch (e) { await client.query('ROLLBACK'); throw e; }
    finally { client.release(); }
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/stats/quiz/:quizId', async (req, res) => {
  const { rows } = await pool.query('SELECT yes_count, no_count FROM totals_quiz WHERE quiz_id=$1', [req.params.quizId]);
  const r = rows[0] || { yes_count:0, no_count:0 };
  res.json({ quizId: req.params.quizId, yes: Number(r.yes_count||0), no: Number(r.no_count||0) });
});
app.get('/api/stats/question/:quizId', async (req, res) => {
  const { rows } = await pool.query('SELECT question_id, yes_count, no_count FROM totals_question WHERE quiz_id=$1 ORDER BY question_id', [req.params.quizId]);
  res.json({ quizId: req.params.quizId, items: rows.map(r => ({ questionId: r.question_id, yes: Number(r.yes_count||0), no: Number(r.no_count||0) }))});
});
app.get('/api/health', (_req, res) => res.json({ ok:true }));

const port = Number(process.env.API_PORT || 8080);
init()
  .then(() => app.listen(port, '0.0.0.0', () => console.log(`API on :${port}`)))
  .catch(err => { console.error('Init failed:', err); process.exit(1); });

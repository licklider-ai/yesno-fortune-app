CREATE TABLE IF NOT EXISTS log_entries (
  id SERIAL PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL CHECK (answer IN ('YES','NO')),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_log_entries_quiz ON log_entries(quiz_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_created ON log_entries(created_at);

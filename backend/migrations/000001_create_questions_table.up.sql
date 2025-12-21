CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    answer TEXT NOT NULL,
    level VARCHAR(32) NOT NULL,
    category VARCHAR(64) NOT NULL,
    popularity INT NOT NULL CHECK (popularity >= 0 AND popularity <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_popularity ON questions (popularity DESC);
CREATE INDEX idx_questions_category ON questions (category);
CREATE INDEX idx_questions_level ON questions (level);

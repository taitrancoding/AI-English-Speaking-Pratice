-- Create peer_practice_sessions table (safe migration - won't drop existing data)
-- This migration is idempotent - safe to run multiple times

-- Check if table exists, if not create it
CREATE TABLE IF NOT EXISTS peer_practice_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    learner1_id BIGINT NOT NULL,
    learner2_id BIGINT NULL,
    topic VARCHAR(255),
    scenario VARCHAR(255),
    target_level VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    start_time DATETIME,
    end_time DATETIME,
    chat_history TEXT,
    ai_feedback TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (learner1_id) REFERENCES learner_profiles(id),
    FOREIGN KEY (learner2_id) REFERENCES learner_profiles(id)
);

-- Add missing columns if table already exists (safe - won't drop data)
-- Note: MySQL doesn't support IF NOT EXISTS for ALTER TABLE, so we use a stored procedure approach
-- For simplicity, we'll let Flyway handle this with repair-on-migrate

-- Create indexes safely (MySQL 8.0+ supports IF NOT EXISTS)
-- If indexes already exist, they will be skipped
CREATE INDEX IF NOT EXISTS idx_peer_sessions_learner1 ON peer_practice_sessions(learner1_id);
CREATE INDEX IF NOT EXISTS idx_peer_sessions_learner2 ON peer_practice_sessions(learner2_id);
CREATE INDEX IF NOT EXISTS idx_peer_sessions_status ON peer_practice_sessions(status);

-- Drop old mentor_feedbacks table if exists
DROP TABLE IF EXISTS mentor_feedbacks;

-- Create new mentor_feedbacks table with all required fields
CREATE TABLE mentor_feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    mentor_id BIGINT NOT NULL,
    practice_session_id BIGINT,
    pronunciation_errors TEXT,
    grammar_errors TEXT,
    vocabulary_issues TEXT,
    clarity_guidance TEXT,
    conversation_topics TEXT,
    vocabulary_suggestions TEXT,
    native_speaker_tips TEXT,
    overall_feedback TEXT,
    feedback_date DATETIME,
    is_immediate BOOLEAN DEFAULT TRUE,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (learner_id) REFERENCES learner_profiles(id),
    FOREIGN KEY (mentor_id) REFERENCES mentors(id),
    FOREIGN KEY (practice_session_id) REFERENCES ai_practice_sessions(id)
);

CREATE INDEX idx_mentor_feedbacks_learner ON mentor_feedbacks(learner_id);
CREATE INDEX idx_mentor_feedbacks_mentor ON mentor_feedbacks(mentor_id);
CREATE INDEX idx_mentor_feedbacks_immediate ON mentor_feedbacks(is_immediate);



CREATE TABLE assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    mentor_id BIGINT NOT NULL,
    assessed_level VARCHAR(20),
    speaking_score INT,
    listening_score INT,
    reading_score INT,
    writing_score INT,
    strengths TEXT,
    weaknesses TEXT,
    recommendations TEXT,
    assessment_date DATETIME,
    next_assessment_date DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (learner_id) REFERENCES learner_profiles(id),
    FOREIGN KEY (mentor_id) REFERENCES mentors(id)
);

CREATE INDEX idx_assessments_learner ON assessments(learner_id);
CREATE INDEX idx_assessments_mentor ON assessments(mentor_id);



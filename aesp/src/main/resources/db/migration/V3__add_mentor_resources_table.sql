CREATE TABLE mentor_resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mentor_id BIGINT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    resource_type VARCHAR(50), -- DOCUMENT, VIDEO, AUDIO, LINK, EXERCISE
    file_url TEXT,
    external_url TEXT,
    category VARCHAR(50), -- GRAMMAR, VOCABULARY, PRONUNCIATION, CONVERSATION
    target_level VARCHAR(20), -- BEGINNER, INTERMEDIATE, ADVANCED
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id)
);

CREATE INDEX idx_mentor_resources_mentor ON mentor_resources(mentor_id);
CREATE INDEX idx_mentor_resources_category_level ON mentor_resources(category, target_level);
CREATE INDEX idx_mentor_resources_public ON mentor_resources(is_public);



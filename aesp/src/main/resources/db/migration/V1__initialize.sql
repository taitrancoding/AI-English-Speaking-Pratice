CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    avatar_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME,
    updated_at DATETIME,
    deleted_at DATETIME DEFAULT NULL
);

CREATE TABLE packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    price DECIMAL(10,2),
    duration_days INT,
    has_mentor BOOLEAN,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME
);

CREATE TABLE system_policies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    created_at DATETIME
);

CREATE TABLE learner_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    english_level VARCHAR(20),
    goals TEXT,
    preferences TEXT,
    ai_score FLOAT,
    pronunciation_score FLOAT,
    total_practice_minutes INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE mentors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    bio TEXT,
    skills TEXT,
    rating FLOAT,
    experience_years INT,
    total_students INT,
    availability_status VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE learner_packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    transaction_id BIGINT,
    purchase_date DATETIME,
    price_at_purchase DECIMAL(10,2),
    expire_date DATETIME,
    payment_status VARCHAR(20),
    FOREIGN KEY (learner_id) REFERENCES learner_profiles(id),
    FOREIGN KEY (package_id) REFERENCES packages(id)
);

CREATE TABLE ai_practice_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    topic VARCHAR(100),
    scenario VARCHAR(100),
    duration_minutes INT,
    pronunciation_score FLOAT,
    grammar_score FLOAT,
    vocabulary_score FLOAT,
    ai_feedback TEXT,
    audio_url TEXT,
    ai_version TEXT,
    created_at DATETIME,
    FOREIGN KEY (learner_id) REFERENCES learner_profiles(id)
);

CREATE TABLE mentor_feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mentor_id BIGINT NOT NULL,
    learner_id BIGINT NOT NULL,
    session_id BIGINT,
    pronunciation_comment TEXT,
    grammar_comment TEXT,
    rating FLOAT,
    improvement_suggestion TEXT,
    created_at DATETIME,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id),
    FOREIGN KEY (learner_id) REFERENCES learner_profiles(id),
    FOREIGN KEY (session_id) REFERENCES ai_practice_sessions(id)
);

CREATE TABLE progress_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    week_start DATE,
    week_end DATE,
    total_sessions INT,
    avg_pronunciation FLOAT,
    avg_grammar FLOAT,
    avg_vocabulary FLOAT,
    generated_at DATETIME,
    improvement_notes TEXT,
    FOREIGN KEY (learner_id) REFERENCES learner_profiles(id)
);

CREATE TABLE feedback_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT,
    target_type VARCHAR(50),
    target_id BIGINT,
    rating INT,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    file_url TEXT,
    report_type VARCHAR(100),
    generated_at DATETIME,
    data_summary TEXT,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

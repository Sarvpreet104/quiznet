CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- ENUMS
-- =========================

CREATE TYPE user_role AS ENUM (
    'student',
    'admin'
);

CREATE TYPE quiz_status AS ENUM (
    'draft',
    'live'
);


-- =========================
-- USERS
-- =========================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100) NOT NULL,

    college_id VARCHAR(50) NOT NULL UNIQUE,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role user_role NOT NULL DEFAULT 'student',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================
-- STUDENT LISTS
-- =========================

CREATE TABLE student_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    owner_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_lists_owner
ON student_lists(owner_id);


-- =========================
-- STUDENT LIST MEMBERS
-- =========================

CREATE TABLE student_list_members (
    list_id UUID NOT NULL
        REFERENCES student_lists(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (list_id, user_id)
);

CREATE INDEX idx_student_list_members_user
ON student_list_members(user_id);


-- =========================
-- QUIZZES
-- =========================

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(200) NOT NULL,

    description TEXT,

    owner_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    status quiz_status NOT NULL DEFAULT 'draft',

    duration_seconds INTEGER NOT NULL
        CHECK (duration_seconds > 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    published_at TIMESTAMPTZ
);

CREATE INDEX idx_quizzes_owner
ON quizzes(owner_id);

CREATE INDEX idx_quizzes_status
ON quizzes(status);


-- =========================
-- QUIZ ↔ STUDENT LISTS
-- =========================

CREATE TABLE quiz_lists (
    quiz_id UUID NOT NULL
        REFERENCES quizzes(id)
        ON DELETE CASCADE,

    list_id UUID NOT NULL
        REFERENCES student_lists(id)
        ON DELETE CASCADE,

    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (quiz_id, list_id)
);

CREATE INDEX idx_quiz_lists_list
ON quiz_lists(list_id);


-- =========================
-- QUESTIONS
-- =========================

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quiz_id UUID NOT NULL
        REFERENCES quizzes(id)
        ON DELETE CASCADE,

    question_text TEXT NOT NULL,

    question_order INTEGER NOT NULL
        CHECK (question_order > 0),

    marks INTEGER NOT NULL DEFAULT 1
        CHECK (marks > 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (quiz_id, question_order)
);

CREATE INDEX idx_questions_quiz
ON questions(quiz_id);


-- =========================
-- OPTIONS
-- =========================

CREATE TABLE options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    question_id UUID NOT NULL
        REFERENCES questions(id)
        ON DELETE CASCADE,

    option_text TEXT NOT NULL,

    option_order INTEGER NOT NULL
        CHECK (option_order > 0),

    is_correct BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (question_id, option_order)
);

CREATE INDEX idx_options_question
ON options(question_id);


-- =========================
-- QUIZ ATTEMPTS
-- =========================

CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quiz_id UUID NOT NULL
        REFERENCES quizzes(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    submitted_at TIMESTAMPTZ,

    score INTEGER NOT NULL DEFAULT 0
        CHECK (score >= 0),

    total_marks INTEGER NOT NULL
        CHECK (total_marks > 0),

    is_submitted BOOLEAN NOT NULL DEFAULT FALSE,

    UNIQUE (quiz_id, user_id)
);

CREATE INDEX idx_quiz_attempts_quiz
ON quiz_attempts(quiz_id);

CREATE INDEX idx_quiz_attempts_user
ON quiz_attempts(user_id);


-- =========================
-- QUIZ RESPONSES
-- =========================

CREATE TABLE quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    attempt_id UUID NOT NULL
        REFERENCES quiz_attempts(id)
        ON DELETE CASCADE,

    question_id UUID NOT NULL
        REFERENCES questions(id)
        ON DELETE CASCADE,

    selected_option_id UUID
        REFERENCES options(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (attempt_id, question_id)
);

CREATE INDEX idx_quiz_responses_attempt
ON quiz_responses(attempt_id);

CREATE INDEX idx_quiz_responses_question
ON quiz_responses(question_id);
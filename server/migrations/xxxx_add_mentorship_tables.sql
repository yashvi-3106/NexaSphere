-- server/migrations/xxxx_add_mentorship_tables.sql

-- 1. Mentorship Profiles Table
CREATE TABLE IF NOT EXISTS mentorship_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('mentor', 'mentee')),
    skills TEXT[] NOT NULL DEFAULT '{}',
    goals TEXT[] DEFAULT '{}',
    capacity INT DEFAULT 2 CHECK (capacity >= 1 AND capacity <= 3),
    timezone VARCHAR(50) NOT NULL,
    availability TEXT[] NOT NULL DEFAULT '{}',
    communication_style VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Mentorship Pairs Table
CREATE TABLE IF NOT EXISTS mentorship_pairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL,
    mentee_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'graduated')),
    compatibility_score INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(mentor_id, mentee_id)
);

-- 3. Milestones / 6-Month Plan Table
CREATE TABLE IF NOT EXISTS mentorship_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pair_id UUID REFERENCES mentorship_pairs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    month_number INT NOT NULL CHECK (month_number BETWEEN 1 AND 6),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
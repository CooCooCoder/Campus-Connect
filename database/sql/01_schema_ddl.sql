-- ==============================================================================
-- CampusConnect: Relational Database Schema Definition (PostgreSQL 14+)
-- Author: Shivamsh Anil Menon
-- Subject: Advanced Database Systems & Backend Architecture
-- ==============================================================================

-- 1. Create Enums for strict domain typing
CREATE TYPE user_role AS ENUM ('STUDENT', 'ORGANIZER', 'ADMIN');
CREATE TYPE event_status AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE registration_status AS ENUM ('CONFIRMED', 'CANCELLED');

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraint: Email format validation check
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    -- Constraint: Unique user email
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- 3. Clubs Table
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT uq_clubs_name UNIQUE (name),
    CONSTRAINT uq_clubs_slug UNIQUE (slug),
    CONSTRAINT chk_clubs_contact_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 4. Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    venue VARCHAR(200) NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INT NOT NULL,
    registered_count INT DEFAULT 0 NOT NULL,
    status event_status DEFAULT 'UPCOMING' NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Foreign Key Constraint
    CONSTRAINT fk_events_club FOREIGN KEY (club_id) 
        REFERENCES clubs(id) ON DELETE CASCADE,

    -- Check Constraints: Capacity and Registration invariants
    CONSTRAINT chk_events_capacity_positive CHECK (capacity > 0),
    CONSTRAINT chk_events_registered_bounds CHECK (registered_count >= 0 AND registered_count <= capacity)
);

-- 5. Registrations Table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    status registration_status DEFAULT 'CONFIRMED' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Foreign Key Constraint
    CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) 
        REFERENCES events(id) ON DELETE CASCADE,

    -- Critical Constraint: Prevents duplicate registration for same student on an event
    CONSTRAINT uq_registrations_event_student UNIQUE (event_id, student_email),

    -- Check Constraint: Valid student email pattern
    CONSTRAINT chk_registrations_email CHECK (student_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ==============================================================================
-- INDEXING STRATEGY
-- ==============================================================================

-- B-Tree Index on Foreign Keys
CREATE INDEX idx_events_club_id ON events(club_id);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);

-- Composite Index for event filtering & sorting (category + date)
CREATE INDEX idx_events_category_date ON events(category, event_date);

-- Partial Index: Rapid lookup for available upcoming events that are not full
CREATE INDEX idx_events_active_available ON events(event_date)
WHERE status = 'UPCOMING' AND registered_count < capacity;

-- GIN Index on JSONB metadata for fast key/value queries on event tags/speakers
CREATE INDEX idx_events_metadata_gin ON events USING GIN (metadata);

-- Index on student email for rapid registration history lookups
CREATE INDEX idx_registrations_student_email ON registrations(student_email);

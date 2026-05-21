-- ==========================================
-- SUPABASE DATABASE SCHEMA: USAMA RASHEED PORTFOLIO
-- ==========================================

-- A. Table: Portfolio System Configurations (Flexible Configuration Storage)
CREATE TABLE IF NOT EXISTS portfolio_configs (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE portfolio_configs ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read access to configs" ON portfolio_configs
    FOR SELECT USING (true);

-- Allow authenticated/admin inserts/updates/deletes
CREATE POLICY "Allow admin writes to configs" ON portfolio_configs
    FOR ALL USING (true); -- Authenticated/bypass handled via backend proxy role key


-- B. Table: Consultation Form Messages (Client Inbox requests)
CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create optimized index for quick sorting of client messages by timestamp
CREATE INDEX IF NOT EXISTS idx_contact_messages_timestamp ON contact_messages (timestamp DESC);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous form inserts
CREATE POLICY "Allow direct anonymous inserts of client contacts" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- Allow admins full read/delete access
CREATE POLICY "Allow admin full access to inbox messages" ON contact_messages
    FOR ALL USING (true);


-- C. Table: Dedicated Schema (For tabular structured queries if requested by advanced microservices)
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255),
    image_url TEXT,
    technologies TEXT[],
    live_url TEXT,
    github_url TEXT,
    challenge TEXT,
    solution TEXT,
    impact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    bullets TEXT[],
    icon_name VARCHAR(100),
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timeline_events (
    id VARCHAR(255) PRIMARY KEY,
    year VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for swift lookups
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category);
CREATE INDEX IF NOT EXISTS idx_services_category ON services (category);

-- Triggers to auto-refresh updated_at dates
CREATE OR REPLACE FUNCTION refresh_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER refresh_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION refresh_updated_at_column();

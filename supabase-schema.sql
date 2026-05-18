-- AI Assistant TODO App Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(50),
    tags TEXT[], -- Array of tags
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(50) DEFAULT 'manual' CHECK (created_by IN ('manual', 'assistant')),
    metadata JSONB DEFAULT '{}'::jsonb -- For additional flexible data
);

-- Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    notification_type VARCHAR(20) DEFAULT 'email' CHECK (notification_type IN ('email', 'whatsapp', 'both')),
    email_sent_at TIMESTAMP WITH TIME ZONE,
    whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(50) DEFAULT 'manual' CHECK (created_by IN ('manual', 'assistant')),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Notification Logs Table (for tracking sent notifications)
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE,
    notification_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);

CREATE INDEX IF NOT EXISTS idx_reminders_task_id ON reminders(task_id);
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);

CREATE INDEX IF NOT EXISTS idx_notification_logs_reminder_id ON notification_logs(reminder_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get pending reminders (for cron job)
CREATE OR REPLACE FUNCTION get_pending_reminders()
RETURNS TABLE (
    id UUID,
    task_id UUID,
    title TEXT,
    message TEXT,
    remind_at TIMESTAMP WITH TIME ZONE,
    notification_type VARCHAR(20),
    task_title TEXT,
    task_description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.task_id,
        r.title,
        r.message,
        r.remind_at,
        r.notification_type,
        t.title as task_title,
        t.description as task_description
    FROM reminders r
    LEFT JOIN tasks t ON r.task_id = t.id
    WHERE r.status = 'pending'
    AND r.remind_at <= NOW()
    ORDER BY r.remind_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get task statistics
CREATE OR REPLACE FUNCTION get_task_statistics()
RETURNS TABLE (
    total_tasks BIGINT,
    pending_tasks BIGINT,
    in_progress_tasks BIGINT,
    completed_tasks BIGINT,
    overdue_tasks BIGINT,
    pending_reminders BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_tasks,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
        COUNT(*) FILTER (WHERE status = 'pending' AND due_date < NOW()) as overdue_tasks,
        (SELECT COUNT(*) FROM reminders WHERE status = 'pending') as pending_reminders
    FROM tasks;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (optional, for multi-user setup in future)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (currently allow all operations - you can modify for authentication later)
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on reminders" ON reminders FOR ALL USING (true);
CREATE POLICY "Allow all operations on notification_logs" ON notification_logs FOR ALL USING (true);

-- Checklist Items Table
CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(50) DEFAULT 'manual' CHECK (created_by IN ('manual', 'assistant')),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for checklist
CREATE INDEX IF NOT EXISTS idx_checklist_completed ON checklist_items(completed);
CREATE INDEX IF NOT EXISTS idx_checklist_category ON checklist_items(category);
CREATE INDEX IF NOT EXISTS idx_checklist_created_at ON checklist_items(created_at);

-- Create trigger for checklist updated_at
CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON checklist_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for checklist
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on checklist_items" ON checklist_items FOR ALL USING (true);

-- Insert some sample data (optional)
INSERT INTO tasks (title, description, status, priority, category, due_date, created_by) VALUES
('Sample Task 1', 'This is a sample task created by the assistant', 'pending', 'medium', 'work', NOW() + INTERVAL '2 days', 'assistant'),
('Sample Task 2', 'This is a manually created task', 'pending', 'high', 'personal', NOW() + INTERVAL '1 day', 'manual');

COMMIT;

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations (with service role key)
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

// Database types
export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  tags?: string[]
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
  created_by: 'manual' | 'assistant'
  metadata?: Record<string, any>
}

export interface Reminder {
  id: string
  task_id?: string
  title: string
  message?: string
  remind_at: string
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  notification_type: 'email' | 'whatsapp' | 'both'
  email_sent_at?: string
  whatsapp_sent_at?: string
  created_at: string
  updated_at: string
  created_by: 'manual' | 'assistant'
  metadata?: Record<string, any>
}

export interface NotificationLog {
  id: string
  reminder_id: string
  notification_type: string
  status: 'success' | 'failed'
  error_message?: string
  sent_at: string
  metadata?: Record<string, any>
}

export interface TaskWithReminders extends Task {
  reminders?: Reminder[]
}

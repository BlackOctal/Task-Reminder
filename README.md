# AI Assistant TODO App

A professional, full-featured TODO application built with Next.js 14, designed to integrate seamlessly with AI assistants. Features include task management, automated reminders, email notifications, and comprehensive CRUD API for AI integration.

## Features

- **Task Management**: Create, read, update, and delete tasks with rich metadata
- **Smart Reminders**: Automated countdown timers with email notifications
- **Email Integration**: Professional email notifications using Resend
- **AI Assistant Ready**: Complete REST API for AI assistant integration
- **Real-time Updates**: Live statistics and countdown timers
- **Professional UI**: Clean, modern interface without emojis
- **Database**: Supabase PostgreSQL with full CRUD operations
- **Deployable**: Ready for Vercel deployment

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend API
- **Deployment**: Vercel (with cron jobs)
- **State Management**: React Hooks
- **Date Handling**: date-fns
- **Icons**: Lucide React

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account (free tier available)
- Resend account (free tier available)
- Vercel account (for deployment)

### 2. Database Setup

1. Create a new project in [Supabase](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy the contents of `supabase-schema.sql` and run it
4. This will create:
   - `tasks` table
   - `reminders` table
   - `notification_logs` table
   - Indexes for performance
   - Helper functions for statistics
   - Row Level Security policies

### 3. Get API Keys

#### Supabase
1. Go to Project Settings > API
2. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

#### Resend
1. Sign up at [Resend](https://resend.com)
2. Verify your domain or use resend's testing domain
3. Create an API key → `RESEND_API_KEY`
4. Note your verified email → `RESEND_FROM_EMAIL`

### 4. Install Dependencies

```bash
npm install
```

### 5. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend Configuration
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_verified_email@yourdomain.com

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your_random_secret_for_cron_jobs
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 7. Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables
4. Deploy

#### Setup Cron Jobs in Vercel

Create a `vercel.json` file in the root:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-reminders",
      "schedule": "* * * * *"
    }
  ]
}
```

This runs the reminder checker every minute.

## API Documentation

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-app.vercel.app/api`

### Authentication
Currently open for all operations. You can add authentication later by modifying the Row Level Security policies in Supabase.

---

### Tasks API

#### GET /api/tasks
List all tasks with optional filters.

**Query Parameters:**
- `status` (optional): Filter by status (pending, in_progress, completed, cancelled)
- `priority` (optional): Filter by priority (low, medium, high, urgent)
- `category` (optional): Filter by category
- `created_by` (optional): Filter by creator (manual, assistant)
- `include_reminders` (optional): Include related reminders (true/false)

**Example Request:**
```bash
curl http://localhost:3000/api/tasks?status=pending&priority=high
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "title": "Complete project report",
      "description": "Finish Q4 report by end of week",
      "status": "pending",
      "priority": "high",
      "category": "work",
      "tags": ["important", "deadline"],
      "due_date": "2024-12-31T23:59:59Z",
      "created_at": "2024-12-01T10:00:00Z",
      "updated_at": "2024-12-01T10:00:00Z",
      "created_by": "assistant",
      "metadata": {}
    }
  ]
}
```

#### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Get milk, eggs, and bread",
  "status": "pending",
  "priority": "medium",
  "category": "personal",
  "tags": ["shopping", "weekly"],
  "due_date": "2024-12-25T18:00:00Z",
  "created_by": "assistant"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid-here",
    "title": "Buy groceries",
    ...
  }
}
```

#### PUT /api/tasks
Update an existing task.

**Request Body:**
```json
{
  "id": "task-uuid-here",
  "status": "completed",
  "priority": "low"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task-uuid-here",
    "status": "completed",
    ...
  }
}
```

#### DELETE /api/tasks
Delete a task.

**Query Parameters:**
- `id` (required): Task ID to delete

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/tasks?id=task-uuid-here
```

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### GET /api/tasks/[id]
Get a single task by ID.

**Query Parameters:**
- `include_reminders` (optional): Include related reminders (true/false)

**Example Request:**
```bash
curl http://localhost:3000/api/tasks/task-uuid-here?include_reminders=true
```

---

### Reminders API

#### GET /api/reminders
List all reminders with optional filters.

**Query Parameters:**
- `status` (optional): Filter by status (pending, sent, failed, cancelled)
- `task_id` (optional): Filter by task ID
- `include_task` (optional): Include related task (true/false)

**Example Request:**
```bash
curl http://localhost:3000/api/reminders?status=pending&include_task=true
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "reminder-uuid",
      "task_id": "task-uuid",
      "title": "Meeting reminder",
      "message": "Team standup in 30 minutes",
      "remind_at": "2024-12-25T09:30:00Z",
      "status": "pending",
      "notification_type": "email",
      "created_at": "2024-12-24T10:00:00Z",
      "created_by": "assistant"
    }
  ]
}
```

#### POST /api/reminders
Create a new reminder.

**Request Body:**
```json
{
  "task_id": "task-uuid-here",
  "title": "Project deadline reminder",
  "message": "Don't forget to submit the project",
  "remind_at": "2024-12-30T09:00:00Z",
  "notification_type": "email",
  "created_by": "assistant"
}
```

**Important Notes:**
- `remind_at` must be a future date/time
- `notification_type` can be: `email`, `whatsapp`, or `both`
- `task_id` is optional (can create standalone reminders)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-reminder-uuid",
    ...
  }
}
```

#### PUT /api/reminders
Update a reminder.

**Request Body:**
```json
{
  "id": "reminder-uuid",
  "status": "cancelled"
}
```

#### DELETE /api/reminders
Delete a reminder.

**Query Parameters:**
- `id` (required): Reminder ID to delete

---

### Statistics API

#### GET /api/stats
Get dashboard statistics and recent activity.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total_tasks": 50,
      "pending_tasks": 15,
      "in_progress_tasks": 10,
      "completed_tasks": 23,
      "overdue_tasks": 2,
      "pending_reminders": 5
    },
    "upcomingReminders": [...],
    "recentTasks": [...]
  }
}
```

---

## AI Assistant Integration

### Example Integration (Python)

```python
import requests
from datetime import datetime, timedelta

BASE_URL = "https://your-app.vercel.app/api"

def create_task(title, description="", priority="medium", due_date=None):
    """Create a task from AI assistant"""
    payload = {
        "title": title,
        "description": description,
        "status": "pending",
        "priority": priority,
        "created_by": "assistant"
    }
    
    if due_date:
        payload["due_date"] = due_date
    
    response = requests.post(f"{BASE_URL}/tasks", json=payload)
    return response.json()

def create_reminder(task_id, title, remind_at, message=""):
    """Create a reminder for a task"""
    payload = {
        "task_id": task_id,
        "title": title,
        "message": message,
        "remind_at": remind_at,
        "notification_type": "email",
        "created_by": "assistant"
    }
    
    response = requests.post(f"{BASE_URL}/reminders", json=payload)
    return response.json()

# Example: User says "Remind me about the dentist appointment tomorrow at 2 PM"
tomorrow_2pm = (datetime.now() + timedelta(days=1)).replace(hour=14, minute=0).isoformat()

task = create_task(
    title="Dentist appointment",
    description="Regular checkup at downtown clinic",
    priority="high",
    due_date=tomorrow_2pm
)

if task["success"]:
    # Create reminder 1 hour before
    reminder_time = (datetime.fromisoformat(tomorrow_2pm) - timedelta(hours=1)).isoformat()
    reminder = create_reminder(
        task_id=task["data"]["id"],
        title="Dentist appointment in 1 hour",
        remind_at=reminder_time,
        message="Your dentist appointment is at 2 PM today"
    )
```

### Example Integration (JavaScript/Node.js)

```javascript
const axios = require('axios');

const BASE_URL = 'https://your-app.vercel.app/api';

async function createTask(title, options = {}) {
  const payload = {
    title,
    description: options.description || '',
    status: options.status || 'pending',
    priority: options.priority || 'medium',
    category: options.category,
    tags: options.tags,
    due_date: options.dueDate,
    created_by: 'assistant'
  };

  const response = await axios.post(`${BASE_URL}/tasks`, payload);
  return response.data;
}

async function createReminder(taskId, title, remindAt, options = {}) {
  const payload = {
    task_id: taskId,
    title,
    message: options.message || '',
    remind_at: remindAt,
    notification_type: options.notificationType || 'email',
    created_by: 'assistant'
  };

  const response = await axios.post(`${BASE_URL}/reminders`, payload);
  return response.data;
}

// Example usage
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(14, 0, 0, 0);

const task = await createTask('Dentist appointment', {
  description: 'Regular checkup at downtown clinic',
  priority: 'high',
  category: 'health',
  dueDate: tomorrow.toISOString()
});

if (task.success) {
  const reminderTime = new Date(tomorrow.getTime() - 60 * 60 * 1000); // 1 hour before
  await createReminder(
    task.data.id,
    'Dentist appointment in 1 hour',
    reminderTime.toISOString(),
    { message: 'Your dentist appointment is at 2 PM today' }
  );
}
```

## How Reminders Work

1. **Creation**: When a reminder is created with a future `remind_at` timestamp, it's stored with status `pending`
2. **Cron Job**: Every minute, Vercel Cron runs `/api/cron/check-reminders`
3. **Processing**: The cron job finds all pending reminders where `remind_at` <= current time
4. **Email Sending**: Uses Resend API to send professionally formatted emails
5. **Status Update**: Updates reminder status to `sent` or `failed`
6. **Logging**: Creates entries in `notification_logs` table

## Customization

### Change Email Template
Edit `/lib/email.ts` to customize email HTML and styling.

### Add WhatsApp Integration
1. Set up Twilio WhatsApp or similar service
2. Add logic in `/app/api/cron/check-reminders/route.ts`
3. Update reminder with `whatsapp_sent_at` timestamp

### Add User Authentication
1. Set up Supabase Auth
2. Modify RLS policies in Supabase
3. Update API routes to check authentication
4. Add user_id to tasks and reminders tables

## Troubleshooting

### Reminders not sending
1. Check cron job is running in Vercel
2. Verify `CRON_SECRET` matches in environment
3. Check Resend API key is valid
4. Check email sender is verified in Resend

### Database connection issues
1. Verify Supabase credentials
2. Check Row Level Security policies
3. Ensure service role key is used for server operations

### Build errors
1. Run `npm install` to ensure all dependencies
2. Check TypeScript errors: `npm run build`
3. Verify all environment variables are set

## License

MIT

## Support

For issues and questions, please open an issue on GitHub or contact support.

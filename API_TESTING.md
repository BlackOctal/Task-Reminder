# API Testing Guide

Complete guide for testing all API endpoints with curl examples.

## Base URL

```bash
# Development
export BASE_URL="http://localhost:3000/api"

# Production
export BASE_URL="https://your-app.vercel.app/api"
```

## Tasks API

### 1. Create a Task

```bash
# Basic task
curl -X POST $BASE_URL/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API docs",
    "priority": "high",
    "status": "pending",
    "created_by": "assistant"
  }'

# Task with all fields
curl -X POST $BASE_URL/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Client meeting preparation",
    "description": "Prepare slides and demo for Q4 review",
    "status": "in_progress",
    "priority": "urgent",
    "category": "work",
    "tags": ["meeting", "important", "Q4"],
    "due_date": "2024-12-31T14:00:00Z",
    "created_by": "assistant",
    "metadata": {
      "client": "Acme Corp",
      "project": "Q4 Review"
    }
  }'
```

### 2. Get All Tasks

```bash
# All tasks
curl $BASE_URL/tasks

# With filters
curl "$BASE_URL/tasks?status=pending&priority=high"

# With reminders included
curl "$BASE_URL/tasks?include_reminders=true"

# Filter by category
curl "$BASE_URL/tasks?category=work"

# Filter by creator
curl "$BASE_URL/tasks?created_by=assistant"

# Multiple filters
curl "$BASE_URL/tasks?status=pending&priority=urgent&category=work"
```

### 3. Get Single Task

```bash
# Replace TASK_ID with actual task ID
curl $BASE_URL/tasks/TASK_ID

# With reminders
curl "$BASE_URL/tasks/TASK_ID?include_reminders=true"
```

### 4. Update Task

```bash
# Update status
curl -X PUT $BASE_URL/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TASK_ID",
    "status": "completed"
  }'

# Update multiple fields
curl -X PUT $BASE_URL/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TASK_ID",
    "status": "in_progress",
    "priority": "urgent",
    "description": "Updated description"
  }'

# Update with metadata
curl -X PUT $BASE_URL/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TASK_ID",
    "metadata": {
      "notes": "Additional information",
      "updated_by": "AI Assistant"
    }
  }'
```

### 5. Delete Task

```bash
curl -X DELETE "$BASE_URL/tasks?id=TASK_ID"
```

## Reminders API

### 1. Create Reminder

```bash
# Basic reminder
curl -X POST $BASE_URL/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team meeting reminder",
    "remind_at": "2024-12-31T09:00:00Z",
    "notification_type": "email",
    "created_by": "assistant"
  }'

# Reminder with task and message
curl -X POST $BASE_URL/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "TASK_ID",
    "title": "Project deadline approaching",
    "message": "Remember to submit the final report by end of day",
    "remind_at": "2024-12-31T08:00:00Z",
    "notification_type": "email",
    "created_by": "assistant",
    "metadata": {
      "importance": "high",
      "project": "Q4 Review"
    }
  }'

# WhatsApp reminder (when implemented)
curl -X POST $BASE_URL/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Urgent notification",
    "remind_at": "2024-12-31T10:00:00Z",
    "notification_type": "both",
    "message": "Check email for important updates"
  }'
```

### 2. Get All Reminders

```bash
# All reminders
curl $BASE_URL/reminders

# Pending only
curl "$BASE_URL/reminders?status=pending"

# For specific task
curl "$BASE_URL/reminders?task_id=TASK_ID"

# With task details
curl "$BASE_URL/reminders?include_task=true"

# Multiple filters
curl "$BASE_URL/reminders?status=pending&include_task=true"
```

### 3. Update Reminder

```bash
# Cancel reminder
curl -X PUT $BASE_URL/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "id": "REMINDER_ID",
    "status": "cancelled"
  }'

# Reschedule reminder
curl -X PUT $BASE_URL/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "id": "REMINDER_ID",
    "remind_at": "2025-01-15T10:00:00Z",
    "status": "pending"
  }'
```

### 4. Delete Reminder

```bash
curl -X DELETE "$BASE_URL/reminders?id=REMINDER_ID"
```

## Statistics API

### Get Dashboard Stats

```bash
curl $BASE_URL/stats | jq '.'

# Pretty print with jq
curl $BASE_URL/stats | jq '{
  total: .data.statistics.total_tasks,
  pending: .data.statistics.pending_tasks,
  completed: .data.statistics.completed_tasks
}'
```

## Cron Job API

### Trigger Reminder Check Manually

```bash
# Requires CRON_SECRET
curl -X POST $BASE_URL/cron/check-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Or GET
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  $BASE_URL/cron/check-reminders
```

## Complete Workflow Examples

### Example 1: Create Task with Reminder

```bash
# Step 1: Create task
TASK_RESPONSE=$(curl -s -X POST $BASE_URL/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dentist appointment",
    "description": "Regular checkup at downtown clinic",
    "priority": "high",
    "category": "health",
    "due_date": "2024-12-31T14:00:00Z",
    "created_by": "assistant"
  }')

# Step 2: Extract task ID
TASK_ID=$(echo $TASK_RESPONSE | jq -r '.data.id')
echo "Created task: $TASK_ID"

# Step 3: Create reminder (1 hour before)
curl -X POST $BASE_URL/reminders \
  -H "Content-Type: application/json" \
  -d "{
    \"task_id\": \"$TASK_ID\",
    \"title\": \"Dentist appointment in 1 hour\",
    \"message\": \"Your dentist appointment is at 2 PM today\",
    \"remind_at\": \"2024-12-31T13:00:00Z\",
    \"notification_type\": \"email\",
    \"created_by\": \"assistant\"
  }"
```

### Example 2: Batch Update Tasks

```bash
# Get all pending tasks
TASKS=$(curl -s "$BASE_URL/tasks?status=pending")

# Extract task IDs (requires jq)
TASK_IDS=$(echo $TASKS | jq -r '.data[].id')

# Update each to in_progress
for TASK_ID in $TASK_IDS; do
  curl -X PUT $BASE_URL/tasks \
    -H "Content-Type: application/json" \
    -d "{\"id\": \"$TASK_ID\", \"status\": \"in_progress\"}"
  echo "Updated task: $TASK_ID"
done
```

### Example 3: Get Overdue Tasks

```bash
# Get all tasks and filter by due date (client-side)
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

curl -s $BASE_URL/tasks | jq --arg now "$CURRENT_DATE" '
  .data[] | 
  select(.due_date != null and .due_date < $now and .status != "completed")
'
```

### Example 4: Daily Report

```bash
#!/bin/bash
# save as daily-report.sh

echo "=== Daily TODO Report ==="
echo ""

# Get stats
STATS=$(curl -s $BASE_URL/stats)

echo "Tasks Overview:"
echo "  Total: $(echo $STATS | jq -r '.data.statistics.total_tasks')"
echo "  Pending: $(echo $STATS | jq -r '.data.statistics.pending_tasks')"
echo "  In Progress: $(echo $STATS | jq -r '.data.statistics.in_progress_tasks')"
echo "  Completed: $(echo $STATS | jq -r '.data.statistics.completed_tasks')"
echo "  Overdue: $(echo $STATS | jq -r '.data.statistics.overdue_tasks')"
echo ""

echo "Upcoming Reminders:"
echo $STATS | jq -r '.data.upcomingReminders[] | "  - \(.title) at \(.remind_at)"'
echo ""

echo "Recent Tasks:"
echo $STATS | jq -r '.data.recentTasks[] | "  - \(.title) [\(.status)]"'
```

## Testing with Python

```python
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:3000/api"

def test_create_task():
    """Test creating a task"""
    payload = {
        "title": "Test Task from Python",
        "description": "Testing the API",
        "priority": "high",
        "created_by": "assistant"
    }
    
    response = requests.post(f"{BASE_URL}/tasks", json=payload)
    print("Create Task:", response.json())
    return response.json()

def test_create_reminder(task_id):
    """Test creating a reminder"""
    remind_time = (datetime.now() + timedelta(hours=1)).isoformat()
    
    payload = {
        "task_id": task_id,
        "title": "Test Reminder",
        "remind_at": remind_time,
        "notification_type": "email",
        "created_by": "assistant"
    }
    
    response = requests.post(f"{BASE_URL}/reminders", json=payload)
    print("Create Reminder:", response.json())
    return response.json()

def test_get_tasks():
    """Test getting tasks"""
    response = requests.get(f"{BASE_URL}/tasks?status=pending")
    print("Get Tasks:", response.json())
    return response.json()

def test_update_task(task_id):
    """Test updating a task"""
    payload = {
        "id": task_id,
        "status": "completed"
    }
    
    response = requests.put(f"{BASE_URL}/tasks", json=payload)
    print("Update Task:", response.json())
    return response.json()

# Run tests
if __name__ == "__main__":
    # Create task
    task_result = test_create_task()
    task_id = task_result["data"]["id"]
    
    # Create reminder for task
    test_create_reminder(task_id)
    
    # Get all tasks
    test_get_tasks()
    
    # Update task
    test_update_task(task_id)
```

## Testing with JavaScript/Node.js

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCreateTask() {
  const response = await axios.post(`${BASE_URL}/tasks`, {
    title: 'Test Task from JavaScript',
    description: 'Testing the API',
    priority: 'high',
    created_by: 'assistant'
  });
  
  console.log('Create Task:', response.data);
  return response.data;
}

async function testCreateReminder(taskId) {
  const remindAt = new Date(Date.now() + 3600000).toISOString();
  
  const response = await axios.post(`${BASE_URL}/reminders`, {
    task_id: taskId,
    title: 'Test Reminder',
    remind_at: remindAt,
    notification_type: 'email',
    created_by: 'assistant'
  });
  
  console.log('Create Reminder:', response.data);
  return response.data;
}

async function testGetTasks() {
  const response = await axios.get(`${BASE_URL}/tasks`, {
    params: { status: 'pending' }
  });
  
  console.log('Get Tasks:', response.data);
  return response.data;
}

async function testUpdateTask(taskId) {
  const response = await axios.put(`${BASE_URL}/tasks`, {
    id: taskId,
    status: 'completed'
  });
  
  console.log('Update Task:', response.data);
  return response.data;
}

// Run tests
(async () => {
  try {
    const task = await testCreateTask();
    await testCreateReminder(task.data.id);
    await testGetTasks();
    await testUpdateTask(task.data.id);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
})();
```

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Title is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Task not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Database connection failed"
}
```

## Rate Limiting (if implemented)

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

## Best Practices

1. **Always check response.success** before using data
2. **Handle errors gracefully** with try-catch
3. **Use ISO 8601** format for dates
4. **Validate data** before sending to API
5. **Store task/reminder IDs** for future operations
6. **Use include_reminders** sparingly (performance)
7. **Filter on server** rather than client when possible
8. **Set created_by: "assistant"** for AI-generated tasks

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "AI Assistant TODO API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Task",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Sample Task\",\n  \"priority\": \"high\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{BASE_URL}}/tasks",
          "host": ["{{BASE_URL}}"],
          "path": ["tasks"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "BASE_URL",
      "value": "http://localhost:3000/api"
    }
  ]
}
```

Save this as `postman-collection.json` and import it into Postman.

"""
AI Assistant TODO App Integration
Add this to your AI assistant project to integrate with the TODO app
"""

import requests
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import json


class TodoAppClient:
    """Client for interacting with the AI Assistant TODO App API"""
    
    def __init__(self, base_url: str = "http://localhost:3000/api"):
        """
        Initialize the TODO app client
        
        Args:
            base_url: Base URL of your TODO app API
                     Development: http://localhost:3000/api
                     Production: https://your-app.vercel.app/api
        """
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
    
    def create_task(
        self,
        title: str,
        description: str = "",
        priority: str = "medium",
        category: Optional[str] = None,
        tags: Optional[List[str]] = None,
        due_date: Optional[str] = None,
        status: str = "pending"
    ) -> Dict[str, Any]:
        """
        Create a new task
        
        Args:
            title: Task title (required)
            description: Task description
            priority: Priority level (low, medium, high, urgent)
            category: Task category
            tags: List of tags
            due_date: Due date in ISO format (e.g., "2024-12-31T23:59:59Z")
            status: Task status (pending, in_progress, completed, cancelled)
        
        Returns:
            API response with created task data
        """
        payload = {
            "title": title,
            "description": description,
            "status": status,
            "priority": priority,
            "created_by": "assistant"
        }
        
        if category:
            payload["category"] = category
        if tags:
            payload["tags"] = tags
        if due_date:
            payload["due_date"] = due_date
        
        response = self.session.post(f"{self.base_url}/tasks", json=payload)
        return response.json()
    
    def get_tasks(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        include_reminders: bool = False
    ) -> Dict[str, Any]:
        """
        Get all tasks with optional filters
        
        Args:
            status: Filter by status
            priority: Filter by priority
            category: Filter by category
            include_reminders: Include related reminders
        
        Returns:
            API response with list of tasks
        """
        params = {}
        if status:
            params["status"] = status
        if priority:
            params["priority"] = priority
        if category:
            params["category"] = category
        if include_reminders:
            params["include_reminders"] = "true"
        
        response = self.session.get(f"{self.base_url}/tasks", params=params)
        return response.json()
    
    def update_task(self, task_id: str, **updates) -> Dict[str, Any]:
        """
        Update a task
        
        Args:
            task_id: Task ID to update
            **updates: Fields to update (status, priority, description, etc.)
        
        Returns:
            API response with updated task data
        """
        payload = {"id": task_id, **updates}
        response = self.session.put(f"{self.base_url}/tasks", json=payload)
        return response.json()
    
    def delete_task(self, task_id: str) -> Dict[str, Any]:
        """
        Delete a task
        
        Args:
            task_id: Task ID to delete
        
        Returns:
            API response
        """
        response = self.session.delete(f"{self.base_url}/tasks?id={task_id}")
        return response.json()
    
    def create_reminder(
        self,
        title: str,
        remind_at: str,
        task_id: Optional[str] = None,
        message: str = "",
        notification_type: str = "email"
    ) -> Dict[str, Any]:
        """
        Create a reminder
        
        Args:
            title: Reminder title (required)
            remind_at: When to remind in ISO format (required, must be future)
            task_id: Associated task ID (optional)
            message: Reminder message
            notification_type: Type of notification (email, whatsapp, both)
        
        Returns:
            API response with created reminder data
        """
        payload = {
            "title": title,
            "message": message,
            "remind_at": remind_at,
            "notification_type": notification_type,
            "created_by": "assistant"
        }
        
        if task_id:
            payload["task_id"] = task_id
        
        response = self.session.post(f"{self.base_url}/reminders", json=payload)
        return response.json()
    
    def get_reminders(
        self,
        status: Optional[str] = None,
        task_id: Optional[str] = None,
        include_task: bool = False
    ) -> Dict[str, Any]:
        """
        Get all reminders with optional filters
        
        Args:
            status: Filter by status (pending, sent, failed, cancelled)
            task_id: Filter by task ID
            include_task: Include related task data
        
        Returns:
            API response with list of reminders
        """
        params = {}
        if status:
            params["status"] = status
        if task_id:
            params["task_id"] = task_id
        if include_task:
            params["include_task"] = "true"
        
        response = self.session.get(f"{self.base_url}/reminders", params=params)
        return response.json()
    
    def update_reminder(self, reminder_id: str, **updates) -> Dict[str, Any]:
        """
        Update a reminder
        
        Args:
            reminder_id: Reminder ID to update
            **updates: Fields to update
        
        Returns:
            API response with updated reminder data
        """
        payload = {"id": reminder_id, **updates}
        response = self.session.put(f"{self.base_url}/reminders", json=payload)
        return response.json()
    
    def delete_reminder(self, reminder_id: str) -> Dict[str, Any]:
        """
        Delete a reminder
        
        Args:
            reminder_id: Reminder ID to delete
        
        Returns:
            API response
        """
        response = self.session.delete(f"{self.base_url}/reminders?id={reminder_id}")
        return response.json()
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get dashboard statistics
        
        Returns:
            API response with statistics and recent activity
        """
        response = self.session.get(f"{self.base_url}/stats")
        return response.json()


# Helper functions for common AI assistant use cases

def parse_relative_date(text: str) -> str:
    """
    Convert relative date expressions to ISO format
    
    Examples:
        "tomorrow at 2pm" -> ISO datetime
        "in 3 hours" -> ISO datetime
        "next friday 9am" -> ISO datetime
    
    Args:
        text: Natural language date expression
    
    Returns:
        ISO formatted datetime string
    """
    # This is a simplified example. For production, use a library like dateparser
    now = datetime.now()
    
    text = text.lower()
    
    # Handle "tomorrow"
    if "tomorrow" in text:
        target_date = now + timedelta(days=1)
        
        # Extract time if present
        if "at" in text or "pm" in text or "am" in text:
            # Simple hour extraction (you can enhance this)
            if "2pm" in text or "2 pm" in text:
                target_date = target_date.replace(hour=14, minute=0, second=0, microsecond=0)
            elif "9am" in text or "9 am" in text:
                target_date = target_date.replace(hour=9, minute=0, second=0, microsecond=0)
        
        return target_date.isoformat()
    
    # Handle "in X hours"
    if "in" in text and "hour" in text:
        try:
            hours = int(text.split("in")[1].split("hour")[0].strip())
            target_date = now + timedelta(hours=hours)
            return target_date.isoformat()
        except:
            pass
    
    # Handle "in X days"
    if "in" in text and "day" in text:
        try:
            days = int(text.split("in")[1].split("day")[0].strip())
            target_date = now + timedelta(days=days)
            return target_date.isoformat()
        except:
            pass
    
    # Default: 1 hour from now
    return (now + timedelta(hours=1)).isoformat()


def extract_priority(text: str) -> str:
    """
    Extract priority from natural language
    
    Args:
        text: User input text
    
    Returns:
        Priority level (low, medium, high, urgent)
    """
    text = text.lower()
    
    if any(word in text for word in ["urgent", "asap", "immediately", "critical"]):
        return "urgent"
    elif any(word in text for word in ["important", "high priority", "high"]):
        return "high"
    elif any(word in text for word in ["low priority", "low", "whenever"]):
        return "low"
    else:
        return "medium"


# Example usage in your AI assistant

def handle_add_task_command(user_input: str, todo_client: TodoAppClient):
    """
    Example handler for "add task" commands
    
    Usage in your AI assistant:
        User: "Add a task to finish the report by tomorrow at 2pm, it's urgent"
        Assistant: calls this function
    """
    # Extract task details from user input
    # This is simplified - use your NLP/AI to extract these properly
    
    title = "Finish the report"  # Extracted from user input
    priority = extract_priority(user_input)  # "urgent"
    due_date = parse_relative_date("tomorrow at 2pm")  # ISO datetime
    
    # Create the task
    result = todo_client.create_task(
        title=title,
        description="User requested via AI assistant",
        priority=priority,
        due_date=due_date,
        category="work"
    )
    
    if result.get("success"):
        task_id = result["data"]["id"]
        return f"Task created successfully! I've set it as {priority} priority with a deadline of tomorrow at 2pm."
    else:
        return f"Sorry, I couldn't create the task: {result.get('error', 'Unknown error')}"


def handle_add_reminder_command(user_input: str, todo_client: TodoAppClient):
    """
    Example handler for "remind me" commands
    
    Usage in your AI assistant:
        User: "Remind me about the dentist appointment tomorrow at 1pm"
        Assistant: calls this function
    """
    # Extract reminder details
    title = "Dentist appointment"  # Extracted from user input
    remind_at = parse_relative_date("tomorrow at 1pm")
    
    # Optionally create a task first
    task_result = todo_client.create_task(
        title=title,
        description="Created from reminder request",
        due_date=remind_at,
        priority="medium"
    )
    
    if task_result.get("success"):
        task_id = task_result["data"]["id"]
        
        # Create reminder 1 hour before
        reminder_time = (datetime.fromisoformat(remind_at) - timedelta(hours=1)).isoformat()
        
        reminder_result = todo_client.create_reminder(
            title=f"Reminder: {title}",
            remind_at=reminder_time,
            task_id=task_id,
            message=f"Your {title} is scheduled for 1 hour from now"
        )
        
        if reminder_result.get("success"):
            return f"Got it! I'll remind you about {title} at {reminder_time}"
    
    return "Sorry, I couldn't set up the reminder"


# Initialize client (add this to your AI assistant initialization)
# In production, use environment variable for the base URL
todo_app = TodoAppClient(base_url="https://your-app.vercel.app/api")

# Example: Integrate into your chat function
def process_user_message(message: str) -> str:
    """
    Your AI assistant's main message processing function
    """
    message_lower = message.lower()
    
    # Check for task-related commands
    if "add task" in message_lower or "create task" in message_lower:
        return handle_add_task_command(message, todo_app)
    
    elif "remind me" in message_lower or "set reminder" in message_lower:
        return handle_add_reminder_command(message, todo_app)
    
    elif "show tasks" in message_lower or "list tasks" in message_lower:
        result = todo_app.get_tasks(status="pending")
        if result.get("success"):
            tasks = result["data"]
            return f"You have {len(tasks)} pending tasks:\n" + "\n".join(
                f"- {task['title']} (Priority: {task['priority']})" 
                for task in tasks
            )
    
    # Continue with your normal AI processing...
    return "Your normal AI response here"

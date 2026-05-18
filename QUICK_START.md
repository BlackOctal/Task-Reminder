# Quick Start Guide

## 🚀 Fast Setup (5 minutes)

### Step 1: Clone and Install
```bash
cd todo-app
npm install
```

### Step 2: Setup Supabase (2 minutes)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to SQL Editor and paste the contents of `supabase-schema.sql`
4. Click "Run" to create all tables and functions
5. Go to Settings > API and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### Step 3: Setup Resend (1 minute)
1. Go to [resend.com](https://resend.com) and create a free account
2. Add your domain or use their test domain
3. Create an API key
4. Note your verified sender email

### Step 4: Configure Environment
Create `.env.local` file:
```bash
# Copy from .env.example
cp .env.example .env.local

# Edit with your values
nano .env.local
```

Paste your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...

RESEND_API_KEY=re_xxxx...
RESEND_FROM_EMAIL=noreply@yourdomain.com

NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=any-random-string-here
```

### Step 5: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Deploy to Production

### Option A: Vercel (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Add all environment variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
   - Deploy!

3. **Verify Cron Job**
   - Go to your project settings in Vercel
   - Click "Cron Jobs" tab
   - Verify the reminder checker is running

### Option B: Self-Hosted

1. **Build the app**
```bash
npm run build
```

2. **Start production server**
```bash
npm start
```

3. **Setup cron job manually**
Add to your crontab:
```bash
* * * * * curl -X POST https://your-domain.com/api/cron/check-reminders \
  -H "Authorization: Bearer your-cron-secret"
```

## 🔧 Configuration

### Email Customization
Edit `lib/email.ts` to customize:
- Email templates
- Styling
- Content

### Reminder Frequency
Edit `vercel.json` to change cron schedule:
```json
{
  "crons": [{
    "path": "/api/cron/check-reminders",
    "schedule": "*/5 * * * *"  // Every 5 minutes
  }]
}
```

Schedule formats:
- `* * * * *` - Every minute
- `*/5 * * * *` - Every 5 minutes
- `0 * * * *` - Every hour
- `0 0 * * *` - Once per day

### Database Customization
Edit `supabase-schema.sql` to add:
- New fields to tables
- Additional indexes
- Custom functions
- New tables

Then run the new SQL in Supabase SQL Editor.

## 🤖 AI Assistant Integration

### Add to Your Python Assistant

1. **Copy the integration file**
```bash
cp assistant-integration.py /path/to/your/assistant/
```

2. **Install dependencies**
```bash
pip install requests python-dateutil
```

3. **Import in your assistant**
```python
from assistant_integration import TodoAppClient, handle_add_task_command

# Initialize
todo_app = TodoAppClient(base_url="https://your-app.vercel.app/api")

# Use in your chat handler
if "add task" in user_message:
    response = handle_add_task_command(user_message, todo_app)
```

### Example Commands Your Assistant Can Handle

User says:
- "Add a task to finish the report by tomorrow"
- "Remind me about the dentist appointment at 2pm"
- "Create a high priority task for the client meeting"
- "Show me all my pending tasks"
- "Mark the grocery shopping task as completed"

### API Endpoints for AI Integration

**Create Task:**
```bash
POST /api/tasks
Content-Type: application/json

{
  "title": "Task from AI",
  "description": "Auto-generated task",
  "priority": "high",
  "due_date": "2024-12-31T23:59:59Z",
  "created_by": "assistant"
}
```

**Create Reminder:**
```bash
POST /api/reminders
Content-Type: application/json

{
  "title": "Reminder from AI",
  "remind_at": "2024-12-31T14:00:00Z",
  "notification_type": "email",
  "created_by": "assistant"
}
```

**Get All Tasks:**
```bash
GET /api/tasks?status=pending&priority=high
```

## 📊 Monitoring

### Check Reminder System
```bash
# View pending reminders
GET /api/reminders?status=pending

# Check notification logs (add this endpoint if needed)
```

### Database Stats
```bash
# View statistics
GET /api/stats
```

### Debugging
1. Check Vercel logs for cron execution
2. Check Supabase logs for database errors
3. Check Resend dashboard for email delivery

## 🔒 Security

### API Authentication (Optional)
To add authentication:

1. **Enable Supabase Auth**
```sql
-- Update RLS policies
CREATE POLICY "Users see own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id);
```

2. **Add user_id column**
```sql
ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE reminders ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

3. **Update API routes to check auth**

### Rate Limiting
Add to API routes:
```typescript
import ratelimit from '@/lib/ratelimit'

const limiter = ratelimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
})

await limiter.check(request, 10) // 10 requests per minute
```

## 📝 Maintenance

### Backup Database
```bash
# Export from Supabase dashboard
# Settings > Database > Connection pooling
# Use pg_dump to backup
```

### Update Dependencies
```bash
npm update
npm audit fix
```

### Clear Old Data
Add a cleanup cron:
```sql
-- Delete completed tasks older than 30 days
DELETE FROM tasks 
WHERE status = 'completed' 
AND completed_at < NOW() - INTERVAL '30 days';
```

## 🆘 Troubleshooting

### Issue: Reminders not sending
**Solution:**
1. Check Vercel cron logs
2. Verify RESEND_API_KEY is correct
3. Check email sender is verified
4. Test manually: `POST /api/cron/check-reminders`

### Issue: Database errors
**Solution:**
1. Verify Supabase credentials
2. Check RLS policies
3. Ensure service role key is set
4. Check table permissions

### Issue: Build fails
**Solution:**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Issue: Email not received
**Solution:**
1. Check spam folder
2. Verify sender email in Resend
3. Check Resend logs
4. Test with different email address

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

## 🎯 Next Steps

After deployment:
1. Test creating tasks manually
2. Test creating tasks via API
3. Test reminder emails
4. Integrate with your AI assistant
5. Customize email templates
6. Add WhatsApp notifications (optional)
7. Add user authentication (optional)

## 💡 Pro Tips

1. **Use Vercel preview deployments** to test changes before production
2. **Monitor email delivery** in Resend dashboard
3. **Set up alerts** for failed cron jobs
4. **Keep task data clean** with periodic cleanup
5. **Use categories and tags** for better organization
6. **Test with your AI assistant** in development first

Good luck with your AI-powered TODO app! 🚀

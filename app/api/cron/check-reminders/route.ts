import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { sendReminderEmail } from '@/lib/email'
import { formatDate } from '@/lib/utils'

// This endpoint should be called by a cron job (e.g., Vercel Cron Jobs)
// Add this to vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/check-reminders",
//     "schedule": "* * * * *"
//   }]
// }

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or has the correct secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = getServiceSupabase()
    
    // Get all pending reminders that are due
    const { data: reminders, error: fetchError } = await supabase
      .from('reminders')
      .select('*, tasks(*)')
      .eq('status', 'pending')
      .lte('remind_at', new Date().toISOString())
      .order('remind_at', { ascending: true })

    if (fetchError) throw fetchError

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending reminders to process',
        processed: 0
      })
    }

    const results = []
    
    for (const reminder of reminders) {
      try {
        // Send email notification if notification_type includes email
        if (reminder.notification_type === 'email' || reminder.notification_type === 'both') {
          const emailResult = await sendReminderEmail({
            to: process.env.USER_EMAIL || process.env.RESEND_FROM_EMAIL!, // ✅ FIXED: Now sends to YOUR email
            taskTitle: reminder.tasks?.title || 'No task linked',
            taskDescription: reminder.tasks?.description,
            reminderTitle: reminder.title,
            reminderMessage: reminder.message,
            dueDate: reminder.tasks?.due_date ? formatDate(reminder.tasks.due_date) : undefined,
            taskUrl: `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${reminder.task_id || ''}`
          })

          if (emailResult.success) {
            // Update reminder status to sent
            await supabase
              .from('reminders')
              .update({
                status: 'sent',
                email_sent_at: new Date().toISOString()
              })
              .eq('id', reminder.id)

            // Log successful notification
            await supabase
              .from('notification_logs')
              .insert({
                reminder_id: reminder.id,
                notification_type: 'email',
                status: 'success',
                metadata: { email_data: emailResult.data }
              })

            results.push({
              reminder_id: reminder.id,
              status: 'success',
              type: 'email'
            })
          } else {
            // Update reminder status to failed
            await supabase
              .from('reminders')
              .update({ status: 'failed' })
              .eq('id', reminder.id)

            // Log failed notification
            await supabase
              .from('notification_logs')
              .insert({
                reminder_id: reminder.id,
                notification_type: 'email',
                status: 'failed',
                error_message: emailResult.error
              })

            results.push({
              reminder_id: reminder.id,
              status: 'failed',
              type: 'email',
              error: emailResult.error
            })
          }
        }

        // TODO: Add WhatsApp notification logic here when ready
        if (reminder.notification_type === 'whatsapp' || reminder.notification_type === 'both') {
          // Placeholder for WhatsApp integration
          // await sendWhatsAppReminder(...)
          
          results.push({
            reminder_id: reminder.id,
            status: 'skipped',
            type: 'whatsapp',
            message: 'WhatsApp integration not yet implemented'
          })
        }
      } catch (error: any) {
        console.error(`Error processing reminder ${reminder.id}:`, error)
        results.push({
          reminder_id: reminder.id,
          status: 'error',
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${reminders.length} reminders`,
      processed: reminders.length,
      results
    })
  } catch (error: any) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Allow POST as well for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}
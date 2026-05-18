import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getServiceSupabase()
    
    // Get task statistics
    const { data: stats, error: statsError } = await supabase
      .rpc('get_task_statistics')

    if (statsError) throw statsError

    // Get upcoming reminders (next 7 days)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { data: upcomingReminders, error: remindersError } = await supabase
      .from('reminders')
      .select('*')
      .eq('status', 'pending')
      .gte('remind_at', new Date().toISOString())
      .lte('remind_at', sevenDaysFromNow.toISOString())
      .order('remind_at', { ascending: true })
      .limit(5)

    if (remindersError) throw remindersError

    // Get recent tasks
    const { data: recentTasks, error: recentError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentError) throw recentError

    return NextResponse.json({
      success: true,
      data: {
        statistics: stats?.[0] || {},
        upcomingReminders: upcomingReminders || [],
        recentTasks: recentTasks || []
      }
    })
  } catch (error: any) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

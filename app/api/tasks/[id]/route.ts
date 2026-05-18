import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const include_reminders = searchParams.get('include_reminders') === 'true'

    const supabase = getServiceSupabase()
    const { data, error } = await supabase
      .from('tasks')
      .select(include_reminders ? '*, reminders(*)' : '*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

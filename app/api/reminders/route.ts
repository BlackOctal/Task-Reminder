import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const { data, error } = await supabase
        .from('reminders')
        .select('*, tasks(*)')
        .eq('id', id)
        .single()

      if (error) throw error

      return NextResponse.json({ success: true, data })
    } else {
      const { data, error } = await supabase
        .from('reminders')
        .select('*, tasks(*)')
        .order('remind_at', { ascending: true })

      if (error) throw error

      return NextResponse.json({ success: true, data })
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task_id, title, message, remind_at, notification_type, created_by } = body

    if (!title || !remind_at) {
      return NextResponse.json(
        { success: false, error: 'Title and remind_at are required' },
        { status: 400 }
      )
    }

    console.log('Received remind_at from frontend:', remind_at)

    const supabase = getServiceSupabase()

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        task_id: task_id || null,
        title,
        message: message || null,
        remind_at, // Use the ISO string directly
        notification_type: notification_type || 'email',
        status: 'pending',
        created_by: created_by || 'manual'
      })
      .select()
      .single()

    if (error) throw error

    console.log('Saved to database:', data.remind_at)

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Reminder ID is required' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()

    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error updating reminder:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Reminder ID is required' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Reminder deleted' })
  } catch (error: any) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// GET /api/tasks - List all tasks with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const created_by = searchParams.get('created_by')
    const include_reminders = searchParams.get('include_reminders') === 'true'

    const supabase = getServiceSupabase()
    let query = supabase
      .from('tasks')
      .select(include_reminders ? '*, reminders(*)' : '*')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (priority) query = query.eq('priority', priority)
    if (category) query = query.eq('category', category)
    if (created_by) query = query.eq('created_by', created_by)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      status = 'pending',
      priority = 'medium',
      category,
      tags,
      due_date,
      created_by = 'manual',
      metadata = {}
    } = body

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        status,
        priority,
        category,
        tags,
        due_date,
        created_by,
        metadata
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/tasks - Update a task
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // If status is being changed to completed, set completed_at
    if (updates.status === 'completed' && !updates.completed_at) {
      updates.completed_at = new Date().toISOString()
    }

    const supabase = getServiceSupabase()
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Task deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// GET /api/checklist - List all checklist items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const completed = searchParams.get('completed')
    const category = searchParams.get('category')

    const supabase = getServiceSupabase()
    let query = supabase
      .from('checklist_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (completed !== null) query = query.eq('completed', completed === 'true')
    if (category) query = query.eq('category', category)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching checklist:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/checklist - Create a new checklist item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      completed = false,
      category,
      created_by = 'manual'
    } = body

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()
    const { data, error } = await supabase
      .from('checklist_items')
      .insert({
        title,
        completed,
        category,
        created_by
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating checklist item:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/checklist - Update a checklist item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()
    const { data, error } = await supabase
      .from('checklist_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error updating checklist item:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/checklist - Delete a checklist item
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()
    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Item deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting checklist item:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

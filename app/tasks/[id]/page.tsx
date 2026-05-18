'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  Tag, 
  Clock,
  CheckCircle2,
  Circle
} from 'lucide-react'
import { formatDate, getPriorityColor, getStatusColor, cn } from '@/lib/utils'
import type { Task } from '@/lib/supabase'
import Countdown from '@/components/Countdown'
import EditTaskModal from '@/components/EditTaskModal'

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchTask()
  }, [params.id])

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${params.id}?include_reminders=true`)
      const data = await response.json()

      if (data.success) {
        setTask(data.data)
      } else {
        router.push('/tasks')
      }
    } catch (error) {
      console.error('Error fetching task:', error)
      router.push('/tasks')
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks?id=${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/tasks')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const toggleTaskStatus = async () => {
    if (!task) return
    
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'

    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: newStatus })
      })

      if (response.ok) {
        fetchTask()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleUpdateTask = async (updates: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: params.id, ...updates })
      })

      if (response.ok) {
        await fetchTask()
        setShowEditModal(false)
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    )
  }

  if (!task) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 sm:py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/tasks"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                  Task Details
                </h1>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={deleteTask}
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Title Section */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
            <div className="flex items-start gap-3 sm:gap-4">
              <button
                onClick={toggleTaskStatus}
                className="mt-1 flex-shrink-0"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 sm:w-7 sm:h-7 text-gray-300 hover:text-purple-500 transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h2 className={cn(
                  "text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 break-words",
                  task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                )}>
                  {task.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs sm:text-sm font-medium",
                    getStatusColor(task.status)
                  )}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs sm:text-sm font-medium",
                    getPriorityColor(task.priority)
                  )}>
                    {task.priority}
                  </span>
                  {task.category && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium flex items-center">
                      <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {task.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-sm sm:text-base text-gray-600 whitespace-pre-wrap break-words">
                {task.description}
              </p>
            </div>
          )}

          {/* Due Date with Countdown */}
          {task.due_date && (
            <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Due Date
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 font-medium mb-3 text-sm sm:text-base">
                  {formatDate(task.due_date)}
                </p>
                {task.status !== 'completed' && (
                  <>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>Time remaining:</span>
                    </div>
                    <div className="overflow-x-auto">
                      <Countdown targetDate={task.due_date} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 mb-1">Created</h4>
                <p className="text-sm text-gray-700">{formatDate(task.created_at)}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 mb-1">Last Updated</h4>
                <p className="text-sm text-gray-700">{formatDate(task.updated_at)}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 mb-1">Created By</h4>
                <p className="text-sm text-gray-700 capitalize">{task.created_by}</p>
              </div>
              {task.completed_at && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-1">Completed</h4>
                  <p className="text-sm text-gray-700">{formatDate(task.completed_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && task && (
        <EditTaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateTask}
        />
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  Tag,
  ArrowLeft,
  Clock
} from 'lucide-react'
import { formatDate, formatTimeAgo, getPriorityColor, getStatusColor, cn } from '@/lib/utils'
import type { Task } from '@/lib/supabase'
import TaskDetailModal from '@/components/TaskDetailModal'
import EditTaskModal from '@/components/EditTaskModal'
import Countdown from '@/components/Countdown'

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [statusFilter, priorityFilter])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (priorityFilter !== 'all') params.append('priority', priorityFilter)

      const response = await fetch(`/api/tasks?${params}`)
      const data = await response.json()

      if (data.success) {
        setTasks(data.data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'

    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: newStatus })
      })

      if (response.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleUpdateTask = async (updates: Partial<Task>) => {
    if (!editingTask) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingTask.id, ...updates })
      })

      if (response.ok) {
        await fetchTasks()
        setEditingTask(null)
        setSelectedTask(null)
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
  }

  const handleEditFromDetail = () => {
    if (selectedTask) {
      setEditingTask(selectedTask)
      setSelectedTask(null)
    }
  }

  const handleDeleteFromDetail = async () => {
    if (selectedTask && confirm('Are you sure you want to delete this task?')) {
      await deleteTask(selectedTask.id)
      setSelectedTask(null)
    }
  }

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  All Tasks
                </h1>
                <p className="text-gray-600 mt-1">{filteredTasks.length} tasks found</p>
              </div>
            </div>
            <Link
              href="/tasks/new"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Task
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first task to get started'}
            </p>
            <Link
              href="/tasks/new"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Task
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
                onClick={() => handleViewTask(task)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleTaskStatus(task)
                        }}
                        className="mt-1 flex-shrink-0"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300 hover:text-purple-500 transition-colors" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className={cn(
                          "text-lg font-semibold text-gray-900 mb-2",
                          task.status === 'completed' && "line-through text-gray-500"
                        )}>
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getStatusColor(task.status)
                          )}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getPriorityColor(task.priority)
                          )}>
                            {task.priority}
                          </span>
                          {task.category && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center">
                              <Tag className="w-3 h-3 mr-1" />
                              {task.category}
                            </span>
                          )}
                          {task.due_date && (
                            <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(task.due_date)}
                            </span>
                          )}
                          <span className="text-gray-500 text-xs ml-auto">
                            {formatTimeAgo(task.created_at)}
                          </span>
                        </div>

                        {/* Countdown Timer for tasks with due dates */}
                        {task.due_date && task.status !== 'completed' && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Clock className="w-4 h-4" />
                              <span>Time remaining:</span>
                            </div>
                            <Countdown targetDate={task.due_date} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingTask(task)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTask(task.id)
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={handleEditFromDetail}
          onDelete={handleDeleteFromDetail}
        />
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleUpdateTask}
        />
      )}
    </div>
  )
}

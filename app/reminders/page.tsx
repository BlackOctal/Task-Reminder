'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Bell,
  Trash2,
  Edit,
  ArrowLeft,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  Save
} from 'lucide-react'
import { formatDate, formatTimeAgo } from '@/lib/utils'
import Countdown from '@/components/Countdown'

interface Reminder {
  id: string
  task_id?: string
  title: string
  message?: string
  remind_at: string
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  notification_type: string
  created_at: string
  created_by: string
}

export default function RemindersPage() {
  const router = useRouter()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    remind_at: '',
    notification_type: 'email'
  })

  useEffect(() => {
    fetchReminders()
    const interval = setInterval(fetchReminders, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders')
      const data = await response.json()
      if (data.success) {
        setReminders(data.data)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteReminder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return

    try {
      const response = await fetch(`/api/reminders?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReminders(reminders.filter(r => r.id !== id))
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    // Convert ISO string to datetime-local format
    const localDate = new Date(reminder.remind_at)
    const year = localDate.getFullYear()
    const month = String(localDate.getMonth() + 1).padStart(2, '0')
    const day = String(localDate.getDate()).padStart(2, '0')
    const hours = String(localDate.getHours()).padStart(2, '0')
    const minutes = String(localDate.getMinutes()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`
    
    setFormData({
      title: reminder.title,
      message: reminder.message || '',
      remind_at: formattedDate,
      notification_type: reminder.notification_type
    })
    setShowForm(true)
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const url = '/api/reminders'
    const method = editingReminder ? 'PUT' : 'POST'
    
    // Convert local datetime-local value to UTC ISO string
    const localDateTime = new Date(formData.remind_at)
    const isoString = localDateTime.toISOString()
    
    console.log('User entered (local):', formData.remind_at)
    console.log('Sending to API (UTC):', isoString)
    
    const payload = editingReminder 
      ? { 
          id: editingReminder.id, 
          title: formData.title, 
          message: formData.message || null, 
          remind_at: isoString, 
          notification_type: formData.notification_type 
        }
      : { 
          title: formData.title, 
          message: formData.message || null, 
          remind_at: isoString, 
          notification_type: formData.notification_type, 
          created_by: 'manual' 
        }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.success) {
      fetchReminders()
      setShowForm(false)
      setEditingReminder(null)
      setFormData({
        title: '',
        message: '',
        remind_at: '',
        notification_type: 'email'
      })
    } else {
      alert(data.error || 'Failed to save reminder')
    }
  } catch (error) {
    console.error('Error saving reminder:', error)
    alert('An error occurred')
  } finally {
    setLoading(false)
  }
}

  const handleCancel = () => {
    setShowForm(false)
    setEditingReminder(null)
    setFormData({
      title: '',
      message: '',
      remind_at: '',
      notification_type: 'email'
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-blue-50 text-blue-700 border-blue-200',
      sent: 'bg-green-50 text-green-700 border-green-200',
      failed: 'bg-red-50 text-red-700 border-red-200',
      cancelled: 'bg-gray-50 text-gray-700 border-gray-200'
    }
    return colors[status] || colors.pending
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 sm:py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center">
                  <Bell className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-purple-600" />
                  Reminders
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">{reminders.length} reminders total</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Reminder
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
              </h2>
              <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Team meeting reminder"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Additional reminder details..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remind At *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.remind_at}
                    onChange={(e) => setFormData({ ...formData, remind_at: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">Set any time (even a few minutes ahead)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Type
                  </label>
                  <select
                    value={formData.notification_type}
                    onChange={(e) => setFormData({ ...formData, notification_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="email">Email Only</option>
                    <option value="whatsapp">WhatsApp Only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {editingReminder ? 'Update' : 'Create'} Reminder
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reminders List */}
        {loading && !showForm ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reminders...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reminders yet</h3>
            <p className="text-gray-600 mb-6">Create your first reminder to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Reminder
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => {
              const isPending = reminder.status === 'pending'
              const reminderDate = new Date(reminder.remind_at)
              const isOverdue = isPending && reminderDate < new Date()

              return (
                <div
                  key={reminder.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          {reminder.status === 'sent' ? (
                            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                          ) : reminder.status === 'failed' ? (
                            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                          ) : (
                            <Bell className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">
                              {reminder.title}
                            </h3>
                            {reminder.message && (
                              <p className="text-sm sm:text-base text-gray-600 mb-3 break-words">{reminder.message}</p>
                            )}
                            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                              <span className={`px-3 py-1 rounded-full border font-medium ${getStatusColor(reminder.status)}`}>
                                {reminder.status}
                              </span>
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                                {reminder.notification_type}
                              </span>
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full flex items-center">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                <span className="truncate">{formatDate(reminder.remind_at)}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Countdown Timer */}
                        {isPending && !isOverdue && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                              <Clock className="w-4 h-4" />
                              <span>Time until reminder:</span>
                            </div>
                            <div className="overflow-x-auto">
                              <Countdown targetDate={reminder.remind_at} />
                            </div>
                          </div>
                        )}

                        {isOverdue && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-red-600 font-semibold text-sm">
                              This reminder is overdue
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        {isPending && (
                          <button
                            onClick={() => handleEdit(reminder)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
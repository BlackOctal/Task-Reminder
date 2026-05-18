'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Calendar, Bell, AlertCircle } from 'lucide-react'

export default function NewReminderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    remind_at: '',
    notification_type: 'email'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // datetime-local gives us: "2024-05-18T19:12"
      // This is in the user's LOCAL timezone
      
      // Convert to a proper Date object (interprets as local time)
      const localDateTime = new Date(formData.remind_at)
      
      // Convert to ISO string (automatically converts to UTC)
      const isoString = localDateTime.toISOString()
      
      console.log('User entered (local):', formData.remind_at)
      console.log('Date object:', localDateTime.toString())
      console.log('Sending to API (UTC):', isoString)

      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          message: formData.message || null,
          remind_at: isoString, // Send UTC ISO string
          notification_type: formData.notification_type,
          created_by: 'manual'
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push('/reminders')
      } else {
        setError(data.error || 'Failed to create reminder')
      }
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <Link
              href="/reminders"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Create New Reminder
              </h1>
              <p className="text-gray-600 mt-1">Set up a reminder notification</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Team meeting, Doctor appointment"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Additional details or notes..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="remind_at" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Remind At *
                </label>
                <input
                  type="datetime-local"
                  id="remind_at"
                  name="remind_at"
                  value={formData.remind_at}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">Time is in your local timezone (24-hour format)</p>
              </div>

              <div>
                <label htmlFor="notification_type" className="block text-sm font-medium text-gray-700 mb-2">
                  <Bell className="w-4 h-4 inline mr-1" />
                  Notification Type
                </label>
                <select
                  id="notification_type"
                  name="notification_type"
                  value={formData.notification_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="email">Email Only</option>
                  <option value="whatsapp">WhatsApp Only</option>
                  <option value="both">Both Email & WhatsApp</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">How you want to be notified</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Bell className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">How reminders work:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Time picker uses 24-hour format (19:00 = 7:00 PM)</li>
                    <li>Checks for pending reminders every minute</li>
                    <li>Email notification sent when time arrives</li>
                    <li>Reminder marked as "sent" automatically</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/reminders"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Create Reminder
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
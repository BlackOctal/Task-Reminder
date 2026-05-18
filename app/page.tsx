'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Plus,
  Calendar,
  Bell,
  ListTodo,
  Activity
} from 'lucide-react'
import { formatTimeAgo, formatDate, getCountdownString } from '@/lib/utils'

interface Statistics {
  total_tasks: number
  pending_tasks: number
  in_progress_tasks: number
  completed_tasks: number
  overdue_tasks: number
  pending_reminders: number
}

interface Task {
  id: string
  title: string
  status: string
  priority: string
  created_at: string
  due_date?: string
}

interface Reminder {
  id: string
  title: string
  remind_at: string
  status: string
}

export default function Home() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data.statistics)
        setRecentTasks(data.data.recentTasks)
        setUpcomingReminders(data.data.upcomingReminders)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats?.total_tasks || 0,
      icon: ListTodo,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Pending',
      value: stats?.pending_tasks || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'In Progress',
      value: stats?.in_progress_tasks || 0,
      icon: Activity,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Completed',
      value: stats?.completed_tasks || 0,
      icon: CheckCircle2,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Overdue',
      value: stats?.overdue_tasks || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
      gradient: 'from-red-500 to-red-600'
    },
    {
      title: 'Pending Reminders',
      value: stats?.pending_reminders || 0,
      icon: Bell,
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 sm:py-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Assistant TODO
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your tasks and reminders efficiently</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <Link 
                href="/checklist"
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
              >
                <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span>Checklist</span>
              </Link>
              <Link 
                href="/reminders"
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span>Reminders</span>
              </Link>
              <Link 
                href="/tasks"
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
              >
                <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">Tasks</span>
              </Link>
              <Link 
                href="/tasks/new"
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span>New</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden card-hover"
              >
                <div className={`h-2 bg-gradient-to-r ${card.gradient}`}></div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                    </div>
                    <div className={`p-4 rounded-lg bg-gradient-to-r ${card.gradient}`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tasks */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
                Recent Tasks
              </h2>
              <Link 
                href="/tasks" 
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View All
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="text-center py-12">
                <ListTodo className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No tasks yet</p>
                <Link 
                  href="/tasks/new"
                  className="inline-flex items-center mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create your first task
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium badge-${task.status.replace('_', '-')}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium badge-${task.priority}`}>
                            {task.priority}
                          </span>
                          <span className="text-gray-500">{formatTimeAgo(task.created_at)}</span>
                        </div>
                      </div>
                      {task.due_date && (
                        <div className="text-right text-sm">
                          <Calendar className="w-4 h-4 inline text-gray-400 mr-1" />
                          <span className="text-gray-600">{formatDate(task.due_date)}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Reminders */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Bell className="w-6 h-6 mr-2 text-indigo-600" />
                Upcoming Reminders
              </h2>
              <Link 
                href="/reminders" 
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View All
              </Link>
            </div>

            {upcomingReminders.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No upcoming reminders</p>
                <Link 
                  href="/reminders/new"
                  className="inline-flex items-center mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create a reminder
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{reminder.title}</h3>
                        <p className="text-sm text-gray-600">{formatDate(reminder.remind_at)}</p>
                      </div>
                      <div className="text-right">
                        <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                          {getCountdownString(reminder.remind_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

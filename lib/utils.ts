import { format, formatDistanceToNow, isPast, isFuture, differenceInMilliseconds } from 'date-fns'

export const formatDate = (date: string | Date) => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export const formatDateShort = (date: string | Date) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

export const formatTimeAgo = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const isOverdue = (date: string | Date) => {
  return isPast(new Date(date))
}

export const isUpcoming = (date: string | Date) => {
  return isFuture(new Date(date))
}

export const getCountdown = (targetDate: string | Date) => {
  const now = new Date()
  const target = new Date(targetDate)
  const diff = differenceInMilliseconds(target, now)
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return { days, hours, minutes, seconds, isPast: false }
}

export const getCountdownString = (targetDate: string | Date) => {
  const countdown = getCountdown(targetDate)
  
  if (countdown.isPast) {
    return 'Overdue'
  }
  
  const parts = []
  if (countdown.days > 0) parts.push(`${countdown.days}d`)
  if (countdown.hours > 0) parts.push(`${countdown.hours}h`)
  if (countdown.minutes > 0) parts.push(`${countdown.minutes}m`)
  if (countdown.seconds > 0 && countdown.days === 0) parts.push(`${countdown.seconds}s`)
  
  return parts.join(' ') || 'Now'
}

export const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    low: 'text-blue-600 bg-blue-50 border-blue-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    urgent: 'text-red-600 bg-red-50 border-red-200',
  }
  return colors[priority] || colors.medium
}

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'text-gray-600 bg-gray-50 border-gray-200',
    in_progress: 'text-blue-600 bg-blue-50 border-blue-200',
    completed: 'text-green-600 bg-green-50 border-green-200',
    cancelled: 'text-red-600 bg-red-50 border-red-200',
  }
  return colors[status] || colors.pending
}

export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

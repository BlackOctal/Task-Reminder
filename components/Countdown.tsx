'use client'

import { useEffect, useState } from 'react'
import { getCountdown } from '@/lib/utils'

interface CountdownProps {
  targetDate: string
  compact?: boolean
  className?: string
}

export default function Countdown({ targetDate, compact = false, className = '' }: CountdownProps) {
  const [countdown, setCountdown] = useState(getCountdown(targetDate))

  useEffect(() => {
    // Update countdown every second
    const interval = setInterval(() => {
      setCountdown(getCountdown(targetDate))
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  if (countdown.isPast) {
    return (
      <div className={`text-red-600 font-semibold ${className}`}>
        Overdue
      </div>
    )
  }

  if (compact) {
    const parts = []
    if (countdown.days > 0) parts.push(`${countdown.days}d`)
    if (countdown.hours > 0) parts.push(`${countdown.hours}h`)
    if (countdown.minutes > 0) parts.push(`${countdown.minutes}m`)
    if (countdown.seconds > 0 && countdown.days === 0) parts.push(`${countdown.seconds}s`)
    
    return (
      <div className={`font-mono font-semibold ${className}`}>
        {parts.join(' ') || 'Now'}
      </div>
    )
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {countdown.days > 0 && (
        <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg px-3 py-2 min-w-[60px]">
          <div className="text-2xl font-bold text-purple-600">{countdown.days}</div>
          <div className="text-xs text-gray-600">days</div>
        </div>
      )}
      <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg px-3 py-2 min-w-[60px]">
        <div className="text-2xl font-bold text-purple-600">{countdown.hours}</div>
        <div className="text-xs text-gray-600">hours</div>
      </div>
      <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg px-3 py-2 min-w-[60px]">
        <div className="text-2xl font-bold text-purple-600">{countdown.minutes}</div>
        <div className="text-xs text-gray-600">mins</div>
      </div>
      <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg px-3 py-2 min-w-[60px]">
        <div className="text-2xl font-bold text-purple-600">{countdown.seconds}</div>
        <div className="text-xs text-gray-600">secs</div>
      </div>
    </div>
  )
}

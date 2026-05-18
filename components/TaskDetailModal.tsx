'use client'

import { X, Calendar, Tag, Clock, Edit, Trash2 } from 'lucide-react'
import { formatDate, getPriorityColor, getStatusColor, cn } from '@/lib/utils'
import type { Task } from '@/lib/supabase'
import Countdown from './Countdown'

interface TaskDetailModalProps {
  task: Task
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function TaskDetailModal({ task, onClose, onEdit, onDelete }: TaskDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h2>
            <div className="flex flex-wrap gap-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                getStatusColor(task.status)
              )}>
                {task.status.replace('_', ' ')}
              </span>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                getPriorityColor(task.priority)
              )}>
                {task.priority}
              </span>
              {task.category && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  {task.category}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Due Date with Countdown */}
          {task.due_date && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Due Date
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 font-medium mb-3">{formatDate(task.due_date)}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Time remaining:</span>
                </div>
                <Countdown targetDate={task.due_date} />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
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

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit Task
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

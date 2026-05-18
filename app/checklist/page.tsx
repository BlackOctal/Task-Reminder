'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  CheckSquare,
  Square,
  Trash2,
  Edit,
  ArrowLeft,
  Tag,
  ShoppingCart
} from 'lucide-react'

interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  category?: string
  created_at: string
}

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('')
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/checklist')
      const data = await response.json()
      if (data.success) {
        setItems(data.data)
      }
    } catch (error) {
      console.error('Error fetching checklist:', error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemTitle.trim()) return

    try {
      const response = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newItemTitle,
          category: newItemCategory || null,
          created_by: 'manual'
        })
      })

      const data = await response.json()
      if (data.success) {
        setItems([data.data, ...items])
        setNewItemTitle('')
        setNewItemCategory('')
      }
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const toggleItem = async (item: ChecklistItem) => {
    try {
      const response = await fetch('/api/checklist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          completed: !item.completed
        })
      })

      if (response.ok) {
        setItems(items.map(i => 
          i.id === item.id ? { ...i, completed: !i.completed } : i
        ))
      }
    } catch (error) {
      console.error('Error toggling item:', error)
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return

    try {
      const response = await fetch(`/api/checklist?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setItems(items.filter(i => i.id !== id))
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const updateItem = async (item: ChecklistItem, newTitle: string, newCategory: string) => {
    try {
      const response = await fetch('/api/checklist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          title: newTitle,
          category: newCategory || null
        })
      })

      if (response.ok) {
        setItems(items.map(i => 
          i.id === item.id ? { ...i, title: newTitle, category: newCategory } : i
        ))
        setEditingItem(null)
      }
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const completedCount = items.filter(i => i.completed).length
  const totalCount = items.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center">
                  <ShoppingCart className="w-8 h-8 mr-3 text-purple-600" />
                  Checklist
                </h1>
                <p className="text-gray-600 mt-1">
                  {completedCount} of {totalCount} items completed
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Item Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <form onSubmit={addItem} className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Add new item (e.g., Milk, Eggs, Bread)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
              <input
                type="text"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                placeholder="Category (optional)"
                className="w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round((completedCount / totalCount) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Checklist Items */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checklist...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items yet</h3>
            <p className="text-gray-600">Add your first item to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md divide-y divide-gray-100">
            {items.map((item) => (
              <div
                key={item.id}
                className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                  item.completed ? 'opacity-60' : ''
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleItem(item)}
                  className="flex-shrink-0"
                >
                  {item.completed ? (
                    <CheckSquare className="w-7 h-7 text-green-600" />
                  ) : (
                    <Square className="w-7 h-7 text-gray-400 hover:text-purple-600 transition-colors" />
                  )}
                </button>

                {/* Content */}
                {editingItem?.id === item.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      defaultValue={item.title}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateItem(item, e.currentTarget.value, newItemCategory)
                        } else if (e.key === 'Escape') {
                          setEditingItem(null)
                        }
                      }}
                      autoFocus
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      defaultValue={item.category || ''}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      placeholder="Category"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const titleInput = e.currentTarget.previousElementSibling as HTMLInputElement
                          updateItem(item, titleInput.value, e.currentTarget.value)
                        } else if (e.key === 'Escape') {
                          setEditingItem(null)
                        }
                      }}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className={`text-lg ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {item.title}
                    </p>
                    {item.category && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs mt-1">
                        <Tag className="w-3 h-3 mr-1" />
                        {item.category}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clear Completed Button */}
        {completedCount > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={async () => {
                if (!confirm(`Delete ${completedCount} completed items?`)) return
                const completedIds = items.filter(i => i.completed).map(i => i.id)
                for (const id of completedIds) {
                  await fetch(`/api/checklist?id=${id}`, { method: 'DELETE' })
                }
                fetchItems()
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear {completedCount} Completed Item{completedCount > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import { X } from 'lucide-react'

export interface PasteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (content: string) => void
}

export const PasteModal = ({ isOpen, onClose, onSave }: PasteModalProps) => {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  if (!isOpen) return null

  const handleSave = () => {
    const trimmed = content.trim()
    if (trimmed.length < 10) {
      alert('Please paste at least 10 characters')
      return
    }
    onSave(trimmed)
    setContent('')
    onClose()
  }

  const handleCancel = () => {
    setContent('')
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Paste Transcript
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <label
            htmlFor="paste-content"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Paste your transcript or meeting notes below:
          </label>
          <textarea
            ref={textareaRef}
            id="paste-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your transcript here... (Zoom transcripts, meeting notes, etc.)"
            className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 resize-none"
            autoFocus
          />
          <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{content.length} characters</span>
            {content.length > 0 && content.length < 10 && (
              <span className="text-orange-600 dark:text-orange-400">
                Minimum 10 characters required
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={content.trim().length < 10}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save as Note
          </button>
        </div>
      </div>
    </div>
  )
}

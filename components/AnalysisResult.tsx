'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X, RefreshCw } from 'lucide-react'
import type { NoteAnalysis } from '@/types'
import { formatDistanceToNow } from 'date-fns'

export interface AnalysisResultProps {
  analysis: NoteAnalysis
  onDismiss?: () => void
  onReanalyze?: () => void
  className?: string
}

export const AnalysisResult = ({
  analysis,
  onDismiss,
  onReanalyze,
  className = '',
}: AnalysisResultProps) => {
  const { content, analyzedAt } = analysis

  return (
    <div
      className={`mt-4 p-4 bg-white dark:bg-gray-800 border-l-4 border-purple-500 rounded-r-lg shadow-sm ${className}`}
    >
      {/* Header with timestamp and actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            AI Analysis
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(analyzedAt, { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onReanalyze && (
            <button
              onClick={onReanalyze}
              className="p-1 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
              aria-label="Re-analyze transcript"
              title="Re-analyze"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Dismiss analysis"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Markdown content with special styling for spec updates */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Special styling for Spec Updates section
            h2: ({ node, ...props }) => {
              const text =
                node?.children?.[0]?.type === 'text' ? (node.children[0] as any).value : ''
              const isSpecUpdates = text.toLowerCase().includes('spec updates')

              return (
                <h2
                  className={`text-lg font-semibold mt-4 mb-2 ${
                    isSpecUpdates
                      ? 'text-purple-600 dark:text-purple-400 border-b border-purple-200 dark:border-purple-800 pb-1'
                      : ''
                  }`}
                  {...props}
                />
              )
            },
            // Styling for section references
            h3: ({ node, ...props }) => (
              <h3 className="text-base font-medium mt-3 mb-2 text-gray-700 dark:text-gray-300" {...props} />
            ),
            // Styling for change types
            strong: ({ node, ...props }) => (
              <strong className="font-semibold text-gray-800 dark:text-gray-200" {...props} />
            ),
            // Lists
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside space-y-1 mt-2 mb-2 text-gray-700 dark:text-gray-300" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

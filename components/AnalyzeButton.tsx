'use client'

import { Loader2, Sparkles, RefreshCw } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import type { AnalysisMode } from '@/types'

export interface AnalyzeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  hasAnalysis?: boolean
  isAnalyzing?: boolean
  isAnalyzingThisNote?: boolean
  onAnalyze?: (noteId: string, mode?: AnalysisMode, specPath?: string) => Promise<void>
  noteId: string
  specPath?: string
}

export const AnalyzeButton = forwardRef<HTMLButtonElement, AnalyzeButtonProps>(
  (
    {
      hasAnalysis = false,
      isAnalyzing = false,
      isAnalyzingThisNote = false,
      onAnalyze,
      noteId,
      specPath,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isAnalyzing
    const isLoading = isAnalyzingThisNote

    const handleClick = () => {
      if (!isDisabled && onAnalyze) {
        onAnalyze(noteId, 'technical', specPath)
      }
    }

    const baseClasses =
      'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const stateClasses = hasAnalysis
      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-100'
      : 'bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'

    const combinedClasses = `${baseClasses} ${stateClasses} ${className}`.trim()

    return (
      <button
        ref={ref}
        onClick={handleClick}
        disabled={isDisabled}
        className={combinedClasses}
        aria-label={
          isLoading
            ? 'Analyzing transcript...'
            : hasAnalysis
              ? 'Re-analyze transcript'
              : 'Analyze transcript with AI'
        }
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : hasAnalysis ? (
          <>
            <RefreshCw className="h-4 w-4" />
            <span>Re-analyze</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span>Analyze with AI</span>
          </>
        )}
      </button>
    )
  }
)

AnalyzeButton.displayName = 'AnalyzeButton'

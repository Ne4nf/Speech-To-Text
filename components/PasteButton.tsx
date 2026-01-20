'use client'

import { Clipboard } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface PasteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void
}

export const PasteButton = forwardRef<HTMLButtonElement, PasteButtonProps>(
  ({ onClick, children, className = '', ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'

    const colorClasses =
      'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'

    const combinedClasses = `${baseClasses} ${colorClasses} ${className}`.trim()

    return (
      <button ref={ref} onClick={onClick} className={combinedClasses} {...props}>
        <Clipboard className="h-4 w-4" />
        <span>{children || 'Paste'}</span>
      </button>
    )
  }
)

PasteButton.displayName = 'PasteButton'

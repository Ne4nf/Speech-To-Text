'use client'

import { FileUp } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef, useRef } from 'react'

export interface UploadButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onFileSelect: (content: string) => void
  accept?: string
}

export const UploadButton = forwardRef<HTMLButtonElement, UploadButtonProps>(
  ({ onFileSelect, accept = '.txt,.md', className = '', ...props }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleClick = () => {
      fileInputRef.current?.click()
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        alert('File too large. Maximum size is 1MB.')
        return
      }

      try {
        const content = await file.text()
        const trimmed = content.trim()
        if (trimmed.length < 10) {
          alert('File content is too short. Minimum 10 characters required.')
          return
        }
        onFileSelect(trimmed)
      } catch (error) {
        console.error('Error reading file:', error)
        alert('Failed to read file. Please try again.')
      }

      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    const baseClasses =
      'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'

    const colorClasses =
      'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800'

    const combinedClasses = `${baseClasses} ${colorClasses} ${className}`.trim()

    return (
      <>
        <button
          ref={ref}
          onClick={handleClick}
          className={combinedClasses}
          aria-label="Upload transcript file"
          {...props}
        >
          <FileUp className="h-4 w-4" />
          <span>Upload</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Hidden file input"
        />
      </>
    )
  }
)

UploadButton.displayName = 'UploadButton'

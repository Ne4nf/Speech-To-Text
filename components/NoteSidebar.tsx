import { useStore } from '@/store/useStore'
import { Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface NoteSidebarProps {
  className?: string
}

export function NoteSidebar({ className = '' }: NoteSidebarProps) {
  const { notes, deleteNote } = useStore()

  if (notes.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Saved Notes</h2>
        <p className="text-gray-500 text-sm">No notes saved yet</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Saved Notes ({notes.length})
      </h2>
      <ul className="space-y-3">
        {notes.map((note) => (
          <li
            key={note.id}
            className="group relative p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <button
              onClick={() => deleteNote(note.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
              aria-label={`Delete note: ${note.content.slice(0, 30)}...`}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
            <p className="text-sm text-gray-700 pr-8 line-clamp-3">
              {note.content}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <span>{note.language === 'en-US' ? '🇺🇸 EN' : '🇻🇳 VI'}</span>
              <span>•</span>
              <span>{formatDistanceToNow(note.createdAt, { addSuffix: true })}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

import { Save } from 'lucide-react'
import { useStore } from '@/store/useStore'

export function SaveNoteButton() {
  const { currentSession, addNote } = useStore()

  const hasContent = currentSession.transcript.trim().length > 0

  return (
    <button
      onClick={addNote}
      disabled={!hasContent}
      className={`
        flex items-center gap-2 px-6 py-3 rounded-lg font-medium
        transition-all duration-200
        ${hasContent
          ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 shadow-lg'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }
      `}
      aria-label="Save note"
    >
      <Save className="w-5 h-5" />
      Save Note
    </button>
  )
}

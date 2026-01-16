import { useStore } from '@/store/useStore'

export function TextArea() {
  const { currentSession } = useStore()

  return (
    <div className="w-full max-w-3xl">
      <textarea
        readOnly
        value={currentSession.transcript + currentSession.interimTranscript}
        placeholder="Your speech will appear here..."
        className="w-full h-64 p-4 text-lg rounded-lg border-2 border-gray-200 bg-white shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-live="polite"
        aria-label="Transcription area"
      />
      <div className="mt-2 text-sm text-gray-500">
        {currentSession.isRecording && (
          <span className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Listening...
          </span>
        )}
      </div>
    </div>
  )
}

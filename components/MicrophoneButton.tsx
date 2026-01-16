import { Mic } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

export function MicrophoneButton() {
  const { currentSession } = useStore()
  const { startRecording, stopRecording, isSupported } = useSpeechRecognition()

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          disabled
          className="w-32 h-32 rounded-full bg-gray-300 cursor-not-allowed opacity-50"
          aria-label="Microphone not supported"
        >
          <Mic className="w-16 h-16 mx-auto text-gray-500" strokeWidth={2} />
        </button>
        <p className="text-sm text-gray-600">
          Speech recognition not supported in this browser
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={currentSession.isRecording ? stopRecording : startRecording}
        className={`
          w-32 h-32 rounded-full flex items-center justify-center
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-4 focus:ring-blue-300
          ${currentSession.isRecording
            ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
            : 'bg-blue-500 hover:bg-blue-600 hover:scale-105 shadow-lg'
          }
        `}
        aria-label={currentSession.isRecording ? 'Stop recording' : 'Start recording'}
        aria-pressed={currentSession.isRecording}
      >
        <Mic className="w-16 h-16 text-white" strokeWidth={2} />
      </button>
      <p className="text-sm font-medium text-gray-700">
        {currentSession.isRecording ? 'Recording...' : 'Tap to speak'}
      </p>
    </div>
  )
}

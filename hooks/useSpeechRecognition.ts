import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { SpeechRecognitionManager } from '@/lib/speech'

export function useSpeechRecognition() {
  const managerRef = useRef<SpeechRecognitionManager | null>(null)
  const {
    startRecording,
    stopRecording,
    updateTranscript,
    currentLanguage,
  } = useStore()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      managerRef.current = new SpeechRecognitionManager()

      managerRef.current.onResult((transcript, isInterim) => {
        if (isInterim) {
          updateTranscript('', transcript)
        } else {
          updateTranscript(transcript, '')
        }
      })

      managerRef.current.onError((error) => {
        console.error('Speech recognition error:', error)
        stopRecording()
      })

      managerRef.current.onEnd(() => {
        // Auto-restart if still supposed to be recording
        // This handles cases where the recognition stops unexpectedly
      })
    }

    return () => {
      managerRef.current?.abort()
    }
  }, [updateTranscript, stopRecording])

  const startRecordingHandler = () => {
    if (managerRef.current) {
      managerRef.current.setLanguage(currentLanguage)
      managerRef.current.start()
      startRecording()
    }
  }

  const stopRecordingHandler = () => {
    if (managerRef.current) {
      managerRef.current.stop()
      stopRecording()
    }
  }

  const isSupported = managerRef.current?.isSupported() ?? false

  return {
    startRecording: startRecordingHandler,
    stopRecording: stopRecordingHandler,
    isSupported,
  }
}

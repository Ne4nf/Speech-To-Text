export interface Note {
  id: string
  content: string
  createdAt: number
  language: Language
}

export interface RecordingSession {
  isRecording: boolean
  transcript: string
  interimTranscript: string
  startTime: number | null
  endTime: number | null
}

export type Language = 'en-US' | 'vi-VN'

export const LANGUAGES = {
  'en-US': 'English',
  'vi-VN': 'Vietnamese',
} as const

export interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

export interface StoreState {
  notes: Note[]
  currentSession: RecordingSession
  currentLanguage: Language

  // Actions
  startRecording: () => void
  stopRecording: () => void
  updateTranscript: (transcript: string, interimTranscript: string) => void
  clearTranscript: () => void
  addNote: () => void
  deleteNote: (noteId: string) => void
  setLanguage: (language: Language) => void
}

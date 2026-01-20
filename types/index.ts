import type { NoteAnalysis, AnalysisMode } from './analysis'

export interface Note {
  id: string
  content: string
  createdAt: number
  language: Language
  analysis?: NoteAnalysis // Optional AI analysis result
}

export interface RecordingSession {
  isRecording: boolean
  transcript: string
  interimTranscript: string
  startTime: number | null
  endTime: number | null
}

export type Language = 'en-US' | 'vi-VN'

// Re-export AI analysis types
export type {
  NoteAnalysis,
  AnalysisMode,
  AnalysisResult,
  Decision,
  SpecFile,
  SpecUpdateSuggestion,
} from './analysis'

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

  // AI Analysis state
  isAnalyzing: boolean
  analyzingNoteId: string | null
  analysisError: string | null

  // Actions
  startRecording: () => void
  stopRecording: () => void
  updateTranscript: (transcript: string, interimTranscript: string) => void
  clearTranscript: () => void
  addNote: () => void
  deleteNote: (noteId: string) => void
  setLanguage: (language: Language) => void

  // AI Analysis actions
  analyzeNote: (noteId: string, mode?: AnalysisMode, specPath?: string) => Promise<void>
  updateNoteAnalysis: (noteId: string, analysis: NoteAnalysis) => void
  clearNoteAnalysis: (noteId: string) => void
  setAnalysisError: (error: string | null) => void
}

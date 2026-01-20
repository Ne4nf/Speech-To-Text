import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { analyzeTranscript, readSpecFile } from '@/app/actions'
import type { StoreState, Note, RecordingSession, Language, AnalysisMode, NoteAnalysis } from '@/types'

const initialState: RecordingSession = {
  isRecording: false,
  transcript: '',
  interimTranscript: '',
  startTime: null,
  endTime: null,
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      notes: [],
      currentSession: initialState,
      currentLanguage: 'en-US',

      // AI Analysis state
      isAnalyzing: false,
      analyzingNoteId: null,
      analysisError: null,

      startRecording: () => {
        set((state) => ({
          currentSession: {
            ...state.currentSession,
            isRecording: true,
            startTime: Date.now(),
            transcript: '',
            interimTranscript: '',
          },
        }))
      },

      stopRecording: () => {
        set((state) => ({
          currentSession: {
            ...state.currentSession,
            isRecording: false,
            endTime: Date.now(),
          },
        }))
      },

      updateTranscript: (transcript: string, interimTranscript: string) => {
        set((state) => ({
          currentSession: {
            ...state.currentSession,
            transcript,
            interimTranscript,
          },
        }))
      },

      clearTranscript: () => {
        set((state) => ({
          currentSession: {
            ...state.currentSession,
            transcript: '',
            interimTranscript: '',
          },
        }))
      },

      addNote: () => {
        const { currentSession, currentLanguage, notes } = get()
        const content = currentSession.transcript.trim()

        if (!content) return

        const newNote: Note = {
          id: crypto.randomUUID(),
          content,
          createdAt: Date.now(),
          language: currentLanguage,
        }

        set({ notes: [newNote, ...notes] })
      },

      deleteNote: (noteId: string) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== noteId),
        }))
      },

      setLanguage: (language: Language) => {
        set({ currentLanguage: language })
      },

      // AI Analysis actions
      analyzeNote: async (noteId: string, mode: AnalysisMode = 'technical', specPath?: string) => {
        const note = get().notes.find((n) => n.id === noteId)
        if (!note) throw new Error('Note not found')
        if (get().isAnalyzing) throw new Error('Analysis already in progress')

        set({ isAnalyzing: true, analyzingNoteId: noteId, analysisError: null })

        try {
          // Read spec file if path provided (context-aware analysis)
          const specFile = specPath ? await readSpecFile(specPath) : null

          // Send both transcript AND spec file to AI
          const result = await analyzeTranscript(note.content, mode, specFile)
          const analysis: NoteAnalysis = {
            content: result.markdown,
            analyzedAt: Date.now(),
            mode,
            version: 1,
          }

          set((state) => ({
            notes: state.notes.map((n) => (n.id === noteId ? { ...n, analysis } : n)),
            isAnalyzing: false,
            analyzingNoteId: null,
          }))
        } catch (error) {
          set({
            isAnalyzing: false,
            analyzingNoteId: null,
            analysisError: error instanceof Error ? error.message : 'Analysis failed',
          })
          throw error
        }
      },

      updateNoteAnalysis: (noteId: string, analysis: NoteAnalysis) => {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === noteId ? { ...n, analysis } : n)),
        }))
      },

      clearNoteAnalysis: (noteId: string) => {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === noteId ? { ...n, analysis: undefined } : n)),
        }))
      },

      setAnalysisError: (error: string | null) => {
        set({ analysisError: error })
      },
    }),
    {
      name: 'voice-dictation-storage',
      partialize: (state) => ({
        notes: state.notes, // Includes analysis field now
        currentLanguage: state.currentLanguage,
        // Note: isAnalyzing, analyzingNoteId, and analysisError are NOT persisted
        // They're transient state that should reset on page reload
      }),
    }
  )
)

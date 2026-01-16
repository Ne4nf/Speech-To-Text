import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StoreState, Note, RecordingSession, Language } from '@/types'

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
    }),
    {
      name: 'voice-dictation-storage',
      partialize: (state) => ({
        notes: state.notes,
        currentLanguage: state.currentLanguage,
      }),
    }
  )
)

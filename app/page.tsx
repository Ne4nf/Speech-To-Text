'use client'

import { useState } from 'react'
import { MicrophoneButton } from '@/components/MicrophoneButton'
import { TextArea } from '@/components/TextArea'
import { SaveNoteButton } from '@/components/SaveNoteButton'
import { NoteSidebar } from '@/components/NoteSidebar'
import { PasteButton } from '@/components/PasteButton'
import { UploadButton } from '@/components/UploadButton'
import { PasteModal } from '@/components/PasteModal'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useStore } from '@/store/useStore'
import type { Note } from '@/types'

export default function Home() {
  const [showPasteModal, setShowPasteModal] = useState(false)
  const { notes, currentLanguage } = useStore()

  const handlePasteSave = (content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
      createdAt: Date.now(),
      language: currentLanguage,
    }
    // Directly add to notes array
    useStore.setState((state) => ({
      notes: [newNote, ...state.notes],
    }))
  }

  const handleFileUpload = (content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
      createdAt: Date.now(),
      language: currentLanguage,
    }
    // Directly add to notes array
    useStore.setState((state) => ({
      notes: [newNote, ...state.notes],
    }))
  }
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Meeting Analysis
          </h1>
          <p className="text-gray-600">
            Record, paste, or upload transcripts and get AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Language selector */}
            <div className="flex justify-center">
              <LanguageSwitcher />
            </div>

            {/* Input buttons row */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <MicrophoneButton />
              <PasteButton onClick={() => setShowPasteModal(true)} />
              <UploadButton onFileSelect={handleFileUpload} />
            </div>

            <TextArea />
            <div className="flex justify-center">
              <SaveNoteButton />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <NoteSidebar className="sticky top-8" />
          </div>
        </div>

        {/* Paste Modal */}
        <PasteModal
          isOpen={showPasteModal}
          onClose={() => setShowPasteModal(false)}
          onSave={handlePasteSave}
        />
      </div>
    </main>
  )
}

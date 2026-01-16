'use client'

import { MicrophoneButton } from '@/components/MicrophoneButton'
import { TextArea } from '@/components/TextArea'
import { SaveNoteButton } from '@/components/SaveNoteButton'
import { NoteSidebar } from '@/components/NoteSidebar'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Voice Dictation
          </h1>
          <p className="text-gray-600">
            Speak naturally and see your words appear in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            <MicrophoneButton />
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
      </div>
    </main>
  )
}

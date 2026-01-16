# Data Model: Voice Dictation Interface (MVP)

**Feature**: 001-voice-dictation
**Date**: 2026-01-15
**Status**: Draft
**Input**: Derived from [spec.md](./spec.md) and [research.md](./research.md)

## Overview

This document defines the data model for the Voice Dictation Interface MVP. The application manages three primary entities: **Notes**, **Recording Sessions**, and **Language Settings**. All data is stored client-side using LocalStorage with Zustand state management.

---

## Entity Definitions

### 1. Note

Represents a saved voice note created from a recording session.

**TypeScript Interface**:
```typescript
interface Note {
  id: string                    // Unique identifier (UUID v4)
  content: string               // Full text content of the note
  title: string                 // Display title (first 50 chars or first line)
  createdAt: number             // Unix timestamp (milliseconds)
  language: Language            // Language used when note was created
}
```

**Fields**:

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `id` | `string` | Unique identifier (UUID v4) | Required, unique |
| `content` | `string` | Full text content | Required, non-empty when saved |
| `title` | `string` | Display title (first 50 chars) | Auto-generated from content |
| `createdAt` | `number` | Creation timestamp | Required, positive integer |
| `language` | `Language` | Language code | Required, must be `en-US` or `vi-VN` |

**Business Rules**:
1. **Title Generation**: First 50 characters of content, or first line if newline exists before char 50
2. **Immutable**: Once created, note content cannot be edited (MVP limitation)
3. **Sort Order**: Most recent first (descending by `createdAt`)
4. **Storage Limit**: Practical limit ~5MB for all notes (LocalStorage constraint)

**State Transitions**:
```
[Created] → [Deleted]
```

---

### 2. Recording Session

Represents a single voice recording session from start to stop.

**TypeScript Interface**:
```typescript
interface RecordingSession {
  id: string                    // Unique session identifier
  isRecording: boolean          // Active recording state
  transcript: string            // Real-time transcript accumulation
  interimTranscript: string     // Current in-progress transcript
  language: Language            // Current language setting
  startTime: number | null      // Session start timestamp
  error: Error | null           // Recording error (if any)
}
```

**Fields**:

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `id` | `string` | Session identifier | Required |
| `isRecording` | `boolean` | Recording active state | Required |
| `transcript` | `string` | Accumulated transcript | Required, can be empty |
| `interimTranscript` | `string` | In-progress text | Required, cleared on final result |
| `language` | `Language` | Speech recognition language | Required |
| `startTime` | `number \| null` | Session start time | Null if not recording |
| `error` | `Error \| null` | Error state | Null if no error |

**Business Rules**:
1. **Single Active Session**: Only one recording session active at a time
2. **Real-Time Updates**: `transcript` updates as user speaks
3. **Interim Results**: `interimTranscript` shows in-progress recognition, replaced on final result
4. **Language Switching**: Changing language stops and restarts recognition

**State Transitions**:
```
[Idle] → [Recording] → [Stopped] → [Idle]
                ↓
             [Error]
```

---

### 3. Language Setting

Represents the speech recognition language preference.

**TypeScript Type**:
```typescript
type Language = 'en-US' | 'vi-VN'

interface LanguageSetting {
  current: Language            // Currently selected language
  supported: Language[]        // All supported languages
}
```

**Values**:

| Code | Language | BCP 47 Tag |
|------|----------|------------|
| `en-US` | English (US) | `en-US` |
| `vi-VN` | Vietnamese | `vi-VN` |

**Business Rules**:
1. **Session Scope**: Preference persists only during browser session (resets on close)
2. **Default Language**: English (`en-US`) as initial default
3. **Switch Behavior**: Language change affects next recognition session (or restarts active session)

---

## Data Storage

### Storage Schema

**LocalStorage Key**: `speech-to-text-notes`

**Structure**:
```typescript
// Stored in LocalStorage (Zustand persist middleware)
interface StoredData {
  notes: Note[]                // Array of saved notes
  version: number              // Schema version for migrations
}
```

**Example Data**:
```json
{
  "notes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "This is my first voice note. I'm testing the dictation.",
      "title": "This is my first voice note. I'm test",
      "createdAt": 1736956800000,
      "language": "en-US"
    },
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "content": "Xin chào, đây là ghi chú tiếng Việt.",
      "title": "Xin chào, đây là ghi chú tiếng Việt.",
      "createdAt": 1736956900000,
      "language": "vi-VN"
    }
  ],
  "version": 1
}
```

### Fallback Storage

**In-Memory Storage** (if LocalStorage disabled):
```typescript
// In-memory fallback (JavaScript array)
let inMemoryNotes: Note[] = []
```

---

## Zustand Store Definition

**File**: `store/useNoteStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NoteStore {
  // State
  notes: Note[]
  recording: RecordingSession
  language: Language

  // Note Actions
  addNote: (content: string, language: Language) => void
  deleteNote: (id: string) => void
  getNote: (id: string) => Note | undefined

  // Recording Actions
  startRecording: () => void
  stopRecording: () => void
  updateTranscript: (transcript: string, isInterim: boolean) => void
  setRecordingError: (error: Error) => void

  // Language Actions
  setLanguage: (language: Language) => void
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      // Initial State
      notes: [],
      recording: {
        id: '',
        isRecording: false,
        transcript: '',
        interimTranscript: '',
        language: 'en-US',
        startTime: null,
        error: null
      },
      language: 'en-US',

      // Note Actions
      addNote: (content, language) => {
        const note: Note = {
          id: crypto.randomUUID(),
          content,
          title: content.length > 50
            ? content.substring(0, 50)
            : content.split('\n')[0],
          createdAt: Date.now(),
          language
        }
        set((state) => ({
          notes: [note, ...state.notes]
        }))
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter(n => n.id !== id)
        }))
      },

      getNote: (id) => {
        return get().notes.find(n => n.id === id)
      },

      // Recording Actions
      startRecording: () => {
        set((state) => ({
          recording: {
            ...state.recording,
            id: crypto.randomUUID(),
            isRecording: true,
            transcript: '',
            interimTranscript: '',
            startTime: Date.now(),
            error: null
          }
        }))
      },

      stopRecording: () => {
        set((state) => ({
          recording: {
            ...state.recording,
            isRecording: false,
            startTime: null,
            interimTranscript: ''
          }
        }))
      },

      updateTranscript: (transcript, isInterim) => {
        set((state) => ({
          recording: {
            ...state.recording,
            transcript: isInterim ? state.recording.transcript : transcript,
            interimTranscript: isInterim ? transcript : ''
          }
        }))
      },

      setRecordingError: (error) => {
        set((state) => ({
          recording: {
            ...state.recording,
            isRecording: false,
            error
          }
        }))
      },

      // Language Actions
      setLanguage: (language) => {
        set({ language })
      }
    }),
    {
      name: 'speech-to-text-storage',
      partialize: (state) => ({
        notes: state.notes
        // Recording state NOT persisted (session-scoped)
        // Language state NOT persisted (session-scoped)
      })
    }
  )
)
```

---

## Relationships

```
┌─────────────────┐
│  Recording      │
│  Session        │
│                 │
│  id: string     │───┐
│  transcript:    │   │
│  language:      │   │ Creates
│  Language       │   │
└─────────────────┘   │
                      │
                      ▼
              ┌───────────────┐
              │  Note         │
              │               │
              │  id: string   │
              │  content: str │
              │  title: str   │
              │  createdAt: n │
              │  language:    │───┐
              └───────────────┘   │
                                  │ Uses
                                  │
                      ┌───────────▼─────────┐
                      │  Language Setting  │
                      │                     │
                      │  en-US (English)    │
                      │  vi-VN (Vietnamese) │
                      └─────────────────────┘
```

---

## Validation Rules

### Note Validation

| Rule | Description | Error Message |
|------|-------------|---------------|
| `content` required | Note content cannot be empty when saved | "Cannot save an empty note" |
| `id` unique | Note ID must be unique | "Note with this ID already exists" |
| `language` valid | Language must be supported | "Language not supported" |

### Recording Session Validation

| Rule | Description | Error Message |
|------|-------------|---------------|
| Single active session | Only one recording at a time | "A recording is already in progress" |
| Permission required | Microphone permission required | "Microphone permission denied" |
| Browser support | Web Speech API required | "Browser not supported. Please use Chrome or Edge" |

### Language Validation

| Rule | Description | Error Message |
|------|-------------|---------------|
| Supported language | Must be `en-US` or `vi-VN` | "Language not supported" |

---

## Migration Strategy

### Version 1 → Future Versions

**Schema Versioning**: Include `version` field in stored data

**Migration Pattern**:
```typescript
const migrate = (persistedState: any, version: number) => {
  if (version === 0) {
    // Migrate from v0 to v1
    return {
      ...persistedState,
      version: 1,
      notes: persistedState.notes || []
    }
  }
  return persistedState
}
```

**Future Considerations**:
- Add note editing functionality
- Add note categories/tags
- Add note search
- Migrate to IndexedDB if 5MB limit reached

---

## Edge Cases and Error Handling

### LocalStorage Full
**Error**: `QuotaExceededError`
**Handling**:
1. Catch error on `setItem`
2. Show user message: "Storage full. Please delete some notes."
3. Fallback to in-memory storage

### LocalStorage Disabled
**Detection**: Try `setItem`/`getItem` in try-catch
**Handling**:
1. Show warning: "LocalStorage disabled. Notes won't persist after browser close."
2. Use in-memory storage

### Browser Not Supported
**Detection**: Check `window.SpeechRecognition` or `window.webkitSpeechRecognition`
**Handling**:
1. Show `BrowserSupportAlert` component
2. Display message: "Browser not supported. Please use Chrome or Edge for speech recognition."
3. Hide microphone button

### Microphone Permission Denied
**Detection**: `NotAllowedError` from Web Speech API
**Handling**:
1. Show error message: "Microphone permission denied. Please enable it in browser settings."
2. Display helpful instructions
3. Provide "Try Again" button

---

## Performance Considerations

1. **Bundle Size**: Note data stored as JSON, minimal overhead
2. **Load Time**: All notes loaded into Zustand on app start
3. **Save Time**: O(1) for save/delete operations (array operations)
4. **Storage Limits**: ~5MB typical, sufficient for hundreds of text notes
5. **Index Creation**: No need - array search sufficient for MVP

---

## Security & Privacy

1. **No PII**: Notes may contain personal information, but stored locally only
2. **No Encryption**: LocalStorage not encrypted (acceptable for single-user device)
3. **No Sync**: No cross-device sync (privacy feature)
4. **No Telemetry**: No usage tracking (per constitution)
5. **Clear on Exit**: Users can clear all data via browser "Clear Site Data"

---

## Testing Considerations

### Unit Tests
- Note creation with auto-generated title
- Note sorting (most recent first)
- Language switching behavior
- Recording session state transitions

### Integration Tests
- LocalStorage save/load cycle
- Zustand persist middleware
- Fallback to in-memory storage

### E2E Tests
- Full user flow: record → save → delete
- Language switching during recording
- Persistence across page refresh

---

## Next Steps

1. ✅ Data Model Defined
2. ⏳ **Phase 1**: Generate component contracts
3. ⏳ **Phase 1**: Generate quickstart guide
4. ⏳ **Phase 1**: Update agent context
5. ⏳ **Phase 2**: Run `/specledger.tasks` for task breakdown

# Data Model: AI Meeting Synthesis Agent

**Feature**: 002-ai-meeting-synthesis
**Date**: 2026-01-16
**Status**: Complete

---

## Overview

This document defines the data model extensions for AI-powered transcript analysis, building on the existing Voice Dictation MVP (SpecLedger-06k).

---

## Entity Definitions

### 1. Note (Extended)

**Existing Structure** (from SpecLedger-06k):
```typescript
interface Note {
  id: string
  content: string
  createdAt: number
  language: Language
}
```

**Extended Structure**:
```typescript
interface Note {
  id: string                      // UUID from crypto.randomUUID()
  content: string                 // Raw transcript text
  createdAt: number               // Unix timestamp (ms)
  language: Language              // 'en-US' | 'vi-VN'
  analysis?: NoteAnalysis         // NEW: AI analysis result
}
```

**Changes**:
- Added optional `analysis` field
- All existing fields preserved (backward compatible)
- Notes without analysis remain functional

**Validation Rules**:
- `id`: Must be valid UUID
- `content`: Max 2000 words for analysis (soft limit, error if exceeded)
- `language`: Must match supported languages
- `analysis`: Valid only if `analyzedAt` is within last 30 days

---

### 2. NoteAnalysis (New Entity)

```typescript
interface NoteAnalysis {
  content: string                // Markdown formatted analysis
  analyzedAt: number             // Unix timestamp (ms)
  mode: AnalysisMode             // Analysis type used
  version: number                // Prompt version (for migrations)
}

type AnalysisMode =
  | 'technical'                  // Extract technical decisions & architectural changes
  | 'actions'                    // Extract action items & owners
  | 'summary'                    // Full meeting summary
```

**Field Descriptions**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `content` | string | Markdown formatted AI analysis | "## Decisions\n### Migrate to Redis\n..." |
| `analyzedAt` | number | Timestamp when analysis was generated | 1705427200000 |
| `mode` | AnalysisMode | Type of analysis performed | 'technical' |
| `version` | number | Prompt schema version (for future migrations) | 1 |

**Constraints**:
- `content`: Max 10,000 characters (practical limit)
- `analyzedAt`: Must be ≥ `createdAt` (analysis after note creation)
- `mode`: Must be one of defined modes
- `version`: Starts at 1, increment when prompt schema changes

**Example**:
```typescript
const analysis: NoteAnalysis = {
  content: `## Technical Decisions

### Migrate Database from MySQL to Redis
- **Priority**: High
- **Assigned to**: Infrastructure Team
- **Deadline**: Q2 2026

Decision made to switch primary data store for improved caching performance and reduced latency.

---
`,
  analyzedAt: Date.now(),
  mode: 'technical',
  version: 1
}
```

---

### 3. SpecFile (New Entity)

**Context-Aware Analysis Enhancement**:

```typescript
interface SpecFile {
  path: string                 // Relative path from specs/ directory (e.g., "001-voice-dictation")
  fileName: string             // File name (typically "spec.md")
  content: string              // Full markdown content of spec file
  exists: boolean              // True if file was successfully read
  lastModified?: number        // Unix timestamp (ms) - optional, from fs.stat
}
```

**Field Descriptions**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `path` | string | Relative path within specs/ directory | "001-voice-dictation" |
| `fileName` | string | Name of the spec file | "spec.md" |
| `content` | string | Full markdown content | "# Feature Specification\n..." |
| `exists` | boolean | Whether file was found and readable | true |
| `lastModified` | number \| undefined | File modification timestamp | 1705427200000 |

**Usage**:
- Read by Server Action `readSpecFile(specPath: string)`
- Sent to AI as context along with transcript
- Used to generate cross-referenced spec update suggestions
- Graceful degradation if file doesn't exist (FR-024)

**Constraints**:
- `path`: Must be relative path within specs/ directory (no "..", no absolute paths)
- `content`: Max 500KB (token limit consideration for LLM)
- `exists`: False triggers graceful degradation in analysis

**Server Action Pattern**:
```typescript
// app/actions/read-spec-file.ts
export async function readSpecFile(specPath: string): Promise<SpecFile> {
  try {
    const fullPath = join(process.cwd(), 'specs', specPath, 'spec.md');
    const content = await readFile(fullPath, 'utf-8');
    const stats = await stat(fullPath);

    return {
      path: specPath,
      fileName: 'spec.md',
      content,
      exists: true,
      lastModified: stats.mtimeMs
    };
  } catch (error) {
    return {
      path: specPath,
      fileName: 'spec.md',
      content: '',
      exists: false
    };
  }
}
```

---

### 4. SpecUpdateSuggestion (New Entity)

**Context-Aware Analysis Output**:

```typescript
interface SpecUpdateSuggestion {
  sectionReference: string      // Section identifier (e.g., "3.1" or "Architecture")
  lineNumber?: number           // Specific line number if available
  sectionTitle: string          // Human-readable section title
  currentContent: string        // Current spec content (excerpt)
  suggestedContent: string      // Proposed new content
  changeType: 'add' | 'modify' | 'remove' | 'replace'
  reason: string                // Explanation from transcript analysis
  confidence: 'high' | 'medium' | 'low'
}
```

**Field Descriptions**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sectionReference` | string | Section identifier in spec | "3.1" or "Architecture" |
| `lineNumber` | number \| undefined | Specific line number (if available) | 45 |
| `sectionTitle` | string | Human-readable section name | "Database Technology" |
| `currentContent` | string | Current spec content (excerpt) | "MySQL 8.0" |
| `suggestedContent` | string | Proposed new content | "Redis 7.2" |
| `changeType` | ChangeType | Type of change needed | "modify" |
| `reason` | string | Explanation from transcript | "Team decided to switch to Redis for caching" |
| `confidence` | Confidence | AI confidence level | "high" |

**Change Types**:
- `add`: New section or content to add to spec
- `modify`: Existing content to update
- `remove`: Content to delete from spec
- `replace`: Replace entire section

**Usage**:
- Parsed from AI response when spec file provided as context
- Converted to Markdown for display in `NoteAnalysis.content`
- Formatted as: "In Section X, change Y to Z because..."
- Enables cross-referenced, actionable spec update suggestions

**Example Markdown Output**:
```markdown
## Spec Updates

### Section 3.1: Database Technology (Line 45)
**Change**: Modify
**Confidence**: High

**Current**: "Database: MySQL 8.0 with InnoDB"

**Suggested**: "Database: Redis 7.2 for caching layer"

**Reason**: Transcript states team decided to switch from MySQL to Redis for improved performance in caching use case.
```

**Validation**:
- `sectionReference`: Must match existing spec sections (if `exists: true`)
- `confidence`: Only 'high' or 'medium' suggestions should be shown to user
- `suggestedContent`: Max 500 characters per suggestion

---

### 5. AnalysisResult (Extended Internal Structure)

**Parsed AI Response Structure** (not stored, used for type safety):

```typescript
interface AnalysisResult {
  decisions: Decision[]
  specUpdates: SpecUpdateSuggestion[]  // NEW: Context-aware spec update suggestions
  filteredBrainstorming: string[]
  summary: string
  hasSpecContext: boolean              // NEW: Whether spec file was provided
}

interface Decision {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  assignedTo?: string
  deadline?: string
  relatesToSpecSection?: string        // NEW: Cross-reference to spec section
}
```

**Usage**:
- Validate AI response before converting to Markdown
- Type-safe parsing with Zod schema
- Converted to Markdown for storage in `NoteAnalysis.content`
- **NEW**: `specUpdates` array only populated when spec file context provided
- **NEW**: `hasSpecContext` flag indicates whether analysis is context-aware
- **NEW**: `relatesToSpecSection` enables cross-linking decisions to spec sections

---

## Zustand Store Extensions

### State Interface

**Existing State** (from SpecLedger-06k):
```typescript
interface StoreState {
  notes: Note[]
  currentSession: RecordingSession
  currentLanguage: Language

  // Existing actions
  startRecording: () => void
  stopRecording: () => void
  updateTranscript: (transcript: string, interimTranscript: string) => void
  clearTranscript: () => void
  addNote: () => void
  deleteNote: (noteId: string) => void
  setLanguage: (language: Language) => void
}
```

**Extended State**:
```typescript
interface StoreState {
  // ... existing fields

  // NEW: AI analysis state
  isAnalyzing: boolean
  analyzingNoteId: string | null
  analysisError: string | null

  // NEW: AI analysis actions
  analyzeNote: (noteId: string, mode?: AnalysisMode) => Promise<void>
  updateNoteAnalysis: (noteId: string, analysis: NoteAnalysis) => void
  clearNoteAnalysis: (noteId: string) => void
  setAnalysisError: (error: string | null) => void
}
```

**New Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `isAnalyzing` | boolean | True when analysis in progress (prevents concurrent) |
| `analyzingNoteId` | string \| null | ID of note currently being analyzed |
| `analysisError` | string \| null | Error message from last failed analysis |

**New Actions**:

```typescript
// Analyze a note with AI (UPDATED for context-aware analysis)
analyzeNote: async (noteId: string, mode: AnalysisMode = 'technical', specPath?: string) => {
  const note = get().notes.find(n => n.id === noteId);
  if (!note) throw new Error('Note not found');
  if (get().isAnalyzing) throw new Error('Analysis already in progress');

  set({ isAnalyzing: true, analyzingNoteId: noteId, analysisError: null });

  try {
    // NEW: Read spec file if path provided (context-aware analysis)
    const specFile = specPath ? await readSpecFile(specPath) : null;

    // Send both transcript AND spec file to AI
    const result = await analyzeTranscript(note.content, mode, specFile);
    const analysis: NoteAnalysis = {
      content: result.markdown,
      analyzedAt: Date.now(),
      mode,
      version: 1
    };

    set((state) => ({
      notes: state.notes.map(n =>
        n.id === noteId ? { ...n, analysis } : n
      ),
      isAnalyzing: false,
      analyzingNoteId: null
    }));
  } catch (error) {
    set({
      isAnalyzing: false,
      analyzingNoteId: null,
      analysisError: error.message
    });
    throw error;
  }
}

// Update note analysis (manual override)
updateNoteAnalysis: (noteId: string, analysis: NoteAnalysis) => {
  set((state) => ({
    notes: state.notes.map(n =>
      n.id === noteId ? { ...n, analysis } : n
    )
  }));
}

// Clear note analysis
clearNoteAnalysis: (noteId: string) => {
  set((state) => ({
    notes: state.notes.map(n =>
      n.id === noteId ? { ...n, analysis: undefined } : n
    )
  }));
}

// Set analysis error state
setAnalysisError: (error: string | null) => {
  set({ analysisError: error });
}
```

---

## LocalStorage Schema

### Storage Key

**Existing**: `voice-dictation-storage`

**No Changes Required** - Analysis stored within existing note structure:

```json
{
  "state": {
    "notes": [
      {
        "id": "uuid-1",
        "content": "Raw transcript text...",
        "createdAt": 1705427200000,
        "language": "en-US",
        "analysis": {
          "content": "## Decisions\n### Migrate to Redis\n...",
          "analyzedAt": 1705427300000,
          "mode": "technical",
          "version": 1
        }
      },
      {
        "id": "uuid-2",
        "content": "Another transcript...",
        "createdAt": 1705427400000,
        "language": "en-US"
        // No analysis field
      }
    ],
    "currentLanguage": "en-US"
  },
  "version": 0
}
```

### Persistence Strategy

**Zustand Persist Configuration** (unchanged from SpecLedger-06k):
```typescript
persist(
  (set, get) => ({
    // ... store implementation
  }),
  {
    name: 'voice-dictation-storage',
    partialize: (state) => ({
      notes: state.notes,
      currentLanguage: state.currentLanguage
    })
  }
)
```

**Migration Strategy**:
- Existing notes without `analysis` field remain valid
- No migration script needed (optional field)
- Version field in `NoteAnalysis` for future schema changes

---

## State Transitions

### Note Lifecycle

```
[Create Note]
    ↓
[Note without analysis]
    ↓
[User clicks "Analyze"]
    ↓
[isAnalyzing = true, analyzingNoteId = noteId]
    ↓
[API Call in Progress]
    ↓
[SUCCESS] → [Note with analysis]
    ↓
[User can re-analyze → Overwrites analysis]

[FAILURE] → [isAnalyzing = false, analysisError set]
    ↓
[User can retry analysis]
```

### Analysis States

| State | isAnalyzing | analyzingNoteId | analysisError | UI Behavior |
|-------|-------------|-----------------|---------------|-------------|
| Idle | false | null | null | Show "Analyze" button |
| Analyzing | true | noteId | null | Show loading spinner |
| Success | false | null | null | Show analysis result |
| Error | false | null | error message | Show error + "Retry" button |

---

## Type Definitions

### Complete TypeScript Module

```typescript
// types/analysis.ts

import type { Language } from './index'

/**
 * Analysis mode determines prompt strategy and output format
 */
export type AnalysisMode =
  | 'technical'    // Extract technical decisions & architectural changes
  | 'actions'      // Extract action items & owners
  | 'summary'      // Full meeting summary

/**
 * AI analysis result attached to a note
 */
export interface NoteAnalysis {
  /** Markdown formatted analysis content */
  content: string
  /** Unix timestamp (ms) when analysis was generated */
  analyzedAt: number
  /** Type of analysis performed */
  mode: AnalysisMode
  /** Prompt schema version (for migrations) */
  version: number
}

/**
 * Extended Note entity with optional AI analysis
 */
export interface NoteWithAnalysis {
  id: string
  content: string
  createdAt: number
  language: Language
  analysis?: NoteAnalysis  // NEW field
}

/**
 * Parsed AI response structure (internal use)
 */
export interface AnalysisResult {
  decisions: Decision[]
  filteredBrainstorming: string[]
  summary: string
}

/**
 * Individual decision extracted from transcript
 */
export interface Decision {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  assignedTo?: string
  deadline?: string
}

/**
 * Store state extensions for AI analysis
 */
export interface AnalysisState {
  isAnalyzing: boolean
  analyzingNoteId: string | null
  analysisError: string | null
}

/**
 * Store actions for AI analysis
 */
export interface AnalysisActions {
  analyzeNote: (noteId: string, mode?: AnalysisMode) => Promise<void>
  updateNoteAnalysis: (noteId: string, analysis: NoteAnalysis) => void
  clearNoteAnalysis: (noteId: string) => void
  setAnalysisError: (error: string | null) => void
}
```

---

## Validation Rules

### Note Analysis Validation

```typescript
import { z } from 'zod'

const NoteAnalysisSchema = z.object({
  content: z.string()
    .max(10000, 'Analysis content too long (max 10,000 characters)')
    .refine(val => val.trim().length > 0, 'Analysis content cannot be empty'),
  analyzedAt: z.number()
    .int('Timestamp must be integer')
    .positive('Timestamp must be positive'),
  mode: z.enum(['technical', 'actions', 'summary']),
  version: z.number()
    .int('Version must be integer')
    .positive('Version must be positive')
})

export function validateNoteAnalysis(data: unknown): NoteAnalysis {
  return NoteAnalysisSchema.parse(data)
}
```

### Transcript Length Validation

```typescript
const MAX_TRANSCRIPT_WORDS = 2000

export function validateTranscriptLength(transcript: string): {
  valid: boolean
  wordCount: number
  error?: string
} {
  const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length

  if (wordCount > MAX_TRANSCRIPT_WORDS) {
    return {
      valid: false,
      wordCount,
      error: `Transcript too long (${wordCount} words). Maximum ${MAX_TRANSCRIPT_WORDS} words. Please split into smaller notes.`
    }
  }

  return { valid: true, wordCount }
}
```

---

## Relationships

### Entity Relationship Diagram

```
Note (1) ──────── (1) NoteAnalysis
    │                      │
    │                      ├── content (Markdown)
    ├── id                 ├── analyzedAt
    ├── content            ├── mode
    ├── createdAt          └── version
    ├── language
    └── analysis? (optional)

Note (1) ──────── (*) AnalysisResult (not stored)
                          │
                          ├── decisions[]
                          │     ├── title
                          │     ├── description
                          │     ├── priority
                          │     ├── assignedTo?
                          │     └── deadline?
                          ├── filteredBrainstorming[]
                          └── summary
```

### Data Flow

```
[User clicks "Analyze"]
    ↓
[analyzeNote action]
    ↓
[validateTranscriptLength]
    ↓
[Server Action: analyzeTranscript]
    ↓
[Anthropic API Call]
    ↓
[parse and validate response]
    ↓
[convert to Markdown]
    ↓
[create NoteAnalysis object]
    ↓
[update Note with analysis field]
    ↓
[Zustand persist to LocalStorage]
```

---

## Migration Path

### From SpecLedger-06k (No Analysis)

**Current State**:
```typescript
interface Note {
  id: string
  content: string
  createdAt: number
  language: Language
}
```

**Migration**:
```typescript
// No migration needed - analysis is optional field
// Existing notes remain valid
// Notes can be analyzed on-demand after feature deployment

// Type assertion for backward compatibility
type NoteLegacy = Omit<Note, 'analysis'>
type NoteV2 = NoteWithAnalysis

// Both types compatible at runtime
```

### Future Schema Versions

**When Prompt Schema Changes**:
```typescript
// Version 1 → Version 2 migration
if (analysis.version === 1) {
  // Re-analyze with new prompt
  await analyzeNote(note.id, analysis.mode)
}
```

---

## Summary

**Key Changes**:
1. Extended `Note` entity with optional `analysis` field
2. New `NoteAnalysis` entity with metadata (timestamp, mode, version)
3. Extended Zustand store with 4 new actions and 3 new state fields
4. No LocalStorage schema changes (reuses existing storage)
5. Full TypeScript type safety with Zod validation

**Backward Compatibility**:
- ✅ Existing notes remain functional without analysis
- ✅ No migration script required
- ✅ Optional field allows gradual adoption
- ✅ Core voice dictation features unaffected

**Next Steps**:
- Define component contracts for UI elements
- Create quickstart guide for developers
- Generate task breakdown with Beads

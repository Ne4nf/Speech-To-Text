# Quickstart Guide: AI Meeting Synthesis Agent

**Feature**: 002-ai-meeting-synthesis
**Last Updated**: 2026-01-16
**Prerequisites**: Voice Dictation MVP (SpecLedger-06k) complete

---

## Overview

This guide helps developers quickly set up and test the AI-powered transcript analysis feature.

---

## Prerequisites

### Required
- ✅ Voice Dictation MVP (SpecLedger-06k) implemented and running
- ✅ Node.js 18+ installed
- ✅ Anthropic API key ([Get one here](https://console.anthropic.com/settings/keys))

### Recommended
- Familiarity with Next.js 14 Server Actions
- Understanding of Zustand state management
- Basic knowledge of React hooks

---

## Installation

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk react-markdown remark-gfm zod
```

**Packages**:
- `@anthropic-ai/sdk`: Official Anthropic TypeScript SDK
- `react-markdown`: Markdown rendering for analysis results
- `remark-gfm`: GitHub Flavored Markdown support
- `zod`: Schema validation for API responses

### 2. Configure Environment Variables

Create `.env.local` in project root:

```bash
# Anthropic API Key for AI transcript analysis
# Get your key at: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

**Important**: Never commit `.env.local` to version control. Add to `.gitignore`.

---

## User Guide: How to Use the Application

### 1. Select Language

**Before recording**, choose your language:
- **English** 🇺🇸 - Click "English" button
- **Vietnamese** 🇻🇳 - Click "Vietnamese" button

The language selector is at the top of the page. Vietnamese voice recognition works in Chrome, Edge, and Safari (iOS 15+).

### 2. Provide Transcript Content

You have **three ways** to provide meeting transcripts:

#### Option A: Voice Recording (Original Method)
1. Click the **microphone button** 🎤
2. Speak naturally in your selected language
3. Click **Stop Recording** when done
4. Transcript appears in real-time

#### Option B: Paste Content
1. Click the **Paste** button 📋
2. Paste your transcript in the modal (Zoom transcripts, meeting notes, etc.)
3. Click **Save as Note**
4. Minimum 10 characters required

#### Option C: Upload File
1. Click the **Upload** button 📁
2. Select a `.txt` or `.md` file
3. Maximum file size: 1MB
4. Content is automatically read and saved as a note

### 3. Save Note

Click **Save Note** to save your transcript to the sidebar.

### 4. Analyze with AI

1. Find your note in the **sidebar**
2. Click **"Analyze with AI"** button on the note
3. Wait for analysis to complete (loading indicator shown)
4. View AI-generated insights:
   - **Decisions** - Final decisions from the meeting
   - **Spec Updates** - Specific suggestions for updating your project spec
   - **Action Items** - Tasks and assignments (if mentioned)

### 5. Understanding Context-Aware Analysis

When you analyze a note, the AI:
- Reads your project spec file (e.g., `specs/001-voice-dictation/spec.md`)
- Cross-references decisions with your spec
- Suggests specific updates like: *"In Section 3.1, change Database from MySQL to Redis"*
- Provides section references and confidence levels

**Without Spec File**: Analysis still works but provides generic decisions without spec references.

### 6. Re-Analyze or Dismiss

- **Re-analyze**: Click the refresh icon to analyze again
- **Dismiss**: Click the X to hide the analysis (note is saved)

---

## Installation

### 3. Verify Setup

```bash
# Check if API key is loaded
echo $ANTHROPIC_API_KEY

# Start dev server
npm run dev
```

Server should start without errors at http://localhost:3000

---

## Quick Test

### 1. Create a Test Note

Open the Voice Dictation app and create a test note:

```
"Maybe we could use Redis for caching. I'm not sure. Let's discuss.
Actually, we decided: Migrate from MySQL to Redis for the primary cache layer.
The team agreed this will improve performance by 40%."
```

Save the note (it should appear in the sidebar).

### 2. Analyze the Note

1. Find the "Analyze with AI" button on the saved note
2. Click the button
3. Wait for analysis (10-15 seconds)
4. View the result below the transcript

**Expected Output**:
```markdown
## Technical Decisions

### Migrate from MySQL to Redis

**Priority**: High

Decision made to switch primary cache layer from MySQL to Redis for improved performance.
Expected performance improvement: 40%.
```

**Notice**: The "maybe we could" brainstorming was filtered out!

---

## Component Usage

### AnalyzeButton (with Context-Aware Analysis)

```typescript
import { AnalyzeButton } from '@/components/AnalyzeButton'
import { useStore } from '@/store/useStore'

function MyComponent() {
  const { analyzeNote, isAnalyzing, analyzingNoteId } = useStore()
  const noteId = 'uuid-here'
  const specPath = '001-voice-dictation' // NEW: Optional spec path for context-aware analysis

  return (
    <AnalyzeButton
      noteId={noteId}
      hasAnalysis={false}
      isAnalyzing={isAnalyzing}
      isAnalyzingThisNote={analyzingNoteId === noteId}
      onAnalyze={() => analyzeNote(noteId, 'technical', specPath)} // UPDATED: Pass spec path
    />
  )
}
```

### AnalysisResult (with Spec Updates)

```typescript
import { AnalysisResult } from '@/components/AnalysisResult'

function MyComponent({ note }: { note: Note }) {
  if (!note.analysis) return null

  return (
    <AnalysisResult
      analysis={note.analysis}
      onDismiss={() => console.log('Dismiss')}
      onReanalyze={() => console.log('Re-analyze')}
    />
  )
}
```

**Expected Output with Spec Context**:
```markdown
## Spec Updates

### Section 3.1: Database Technology (Line 45)
**Change**: Modify
**Confidence**: High

**Current**: "Database: MySQL 8.0 with InnoDB"

**Suggested**: "Database: Redis 7.2 for caching layer"

**Reason**: Transcript states team decided to switch from MySQL to Redis for improved performance in caching use case.

## Decisions

- [HIGH] Migrate authentication to OAuth 2.0 (Relates to Section 4: Security)
```

### ErrorDisplay

```typescript
import { ErrorDisplay } from '@/components/ErrorDisplay'

function MyComponent() {
  const [error, setError] = useState<string | null>(null)

  return (
    <>
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={() => console.log('Retry')}
          onDismiss={() => setError(null)}
          variant="inline"
        />
      )}
    </>
  )
}
```

---

## Store Usage

### Analyze a Note (with Context-Aware Analysis)

```typescript
import { useStore } from '@/store/useStore'

function NoteCard({ note }: { note: Note }) {
  const { analyzeNote, isAnalyzing, analysisError } = useStore()

  const handleAnalyze = async () => {
    try {
      // UPDATED: Pass spec path for context-aware analysis (optional)
      await analyzeNote(note.id, 'technical', '001-voice-dictation')
      console.log('Analysis complete!')
    } catch (error) {
      console.error('Analysis failed:', error)
    }
  }

  return (
    <div>
      <button onClick={handleAnalyze} disabled={isAnalyzing}>
        {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
      </button>
      {analysisError && <div className="text-red-500">{analysisError}</div>}
    </div>
  )
}
```

### Check Analysis State

```typescript
const { notes } = useStore()

// Find notes with analysis
const analyzedNotes = notes.filter(note => note.analysis)

// Get analysis timestamp
const lastAnalyzed = notes
  .filter(note => note.analysis)
  .sort((a, b) => b.analysis!.analyzedAt - a.analysis!.analyzedAt)[0]

console.log('Last analyzed:', lastAnalyzed?.analysis?.analyzedAt)
```

### Clear Analysis

```typescript
const { clearNoteAnalysis } = useStore()

// Remove analysis from note
clearNoteAnalysis(noteId)
```

---

## Server Action Implementation

### Create Server Action (UPDATED for Context-Aware Analysis)

Create `app/actions/analyze-transcript.ts`:

```typescript
'use server'

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { readSpecFile } from './read-spec-file' // NEW: Import spec file reader

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// UPDATED: Accept optional specFile parameter
export async function analyzeTranscript(
  transcript: string,
  mode: 'technical' | 'actions' | 'summary',
  specFile?: SpecFile | null
) {
  // Validate API key
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }

  // Validate transcript length
  const wordCount = transcript.split(/\s+/).length
  if (wordCount > 2000) {
    throw new Error(`Transcript too long (${wordCount} words). Maximum 2000 words.`)
  }

  // NEW: Build enhanced prompt with spec context
  const systemPrompt = getSystemPrompt(mode, specFile)

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: specFile?.exists
          ? `Analyze this transcript with the following project specification as context:\n\n${specFile.content}\n\n---\n\nTranscript to analyze:\n\n${transcript}`
          : `Analyze this transcript and extract final decisions:\n\n${transcript}`
      }]
    })

    // Extract and validate response
    const content = response.content[0].text
    return { markdown: content, success: true }

  } catch (error: any) {
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please wait and try again.')
    }
    throw new Error(error.message || 'Analysis failed')
  }
}

function getSystemPrompt(mode: string, specFile?: SpecFile | null): string {
  // NEW: Enhanced prompt for context-aware analysis
  if (specFile?.exists) {
    return `You are an expert meeting analyst with access to the project specification.
Your task is to:
1. Analyze the meeting transcript
2. Cross-reference decisions with the provided specification
3. Identify conflicts or updates needed in the specification
4. Suggest specific spec updates with section references (e.g., "In Section 3.1, change Database from MySQL to Redis")

Output Format:
- **Spec Updates**: Section reference, line number (if available), current content, suggested content, reason
- **Decisions**: Final decisions with cross-references to spec sections
- **Action Items**: Tasks and assignments

Focus on technical decisions and architectural changes when mode is 'technical'.`
  }

  // Original prompt for non-context-aware analysis
  const basePrompt = `You are an expert meeting analyst. Extract final decisions from transcripts while filtering out brainstorming content.`

  const modeInstructions = {
    technical: 'Focus on technical decisions and architectural changes.',
    actions: 'Focus on action items, assignments, and deadlines.',
    summary: 'Provide a comprehensive meeting summary.'
  }

  return `${basePrompt}\n\n${modeInstructions[mode] || ''}\n\nOutput in Markdown format.`
}
```

### Create Spec File Reader (NEW)

Create `app/actions/read-spec-file.ts`:

```typescript
'use server'

import { readFile, stat } from 'fs/promises'
import { join } from 'path'

export interface SpecFile {
  path: string
  fileName: string
  content: string
  exists: boolean
  lastModified?: number
}

export async function readSpecFile(specPath: string): Promise<SpecFile> {
  // Security: Validate path (prevent directory traversal)
  if (specPath.includes('..') || specPath.startsWith('/')) {
    throw new Error('Invalid spec path')
  }

  try {
    const fullPath = join(process.cwd(), 'specs', specPath, 'spec.md')
    const content = await readFile(fullPath, 'utf-8')
    const stats = await stat(fullPath)

    return {
      path: specPath,
      fileName: 'spec.md',
      content,
      exists: true,
      lastModified: stats.mtimeMs
    }
  } catch (error) {
    // Graceful degradation: return exists: false
    console.error('Failed to read spec file:', error)
    return {
      path: specPath,
      fileName: 'spec.md',
      content: '',
      exists: false
    }
  }
}
```

---

## Troubleshooting

### "API Key Not Set" Error

**Problem**: `ANTHROPIC_API_KEY` environment variable not found

**Solution**:
1. Check `.env.local` exists in project root
2. Verify API key is valid: `echo $ANTHROPIC_API_KEY`
3. Restart dev server after adding environment variable
4. Check `.env.local` is in `.gitignore`

### Rate Limit Error (429)

**Problem**: Too many API requests in short time

**Solution**:
1. Wait 60 seconds before retrying
2. Consider implementing request queuing
3. Check Anthropic console for rate limit details

### Transcript Too Long

**Problem**: Note exceeds 2000 word limit

**Solution**:
1. Edit note to remove unnecessary content
2. Split into multiple shorter notes
3. Analyze each part separately

### Analysis Not Persisting

**Problem**: Analysis disappears after refresh

**Solution**:
1. Check Zustand persist middleware is configured
2. Verify LocalStorage has available quota
3. Check browser console for errors
4. Test in incognito mode (disable extensions)

### Empty Analysis Result

**Problem**: AI returns empty or incomplete analysis

**Solution**:
1. Check if transcript contains clear decisions
2. Verify prompt is being sent correctly
3. Try different analysis mode
4. Check Anthropic API status page

### "Spec File Not Found" Warning

**Problem**: Analysis completes but no spec update suggestions appear

**Solution**:
1. Verify spec file exists at `specs/{specPath}/spec.md`
2. Check file path is correct (no leading slash, no "..")
3. Ensure file is readable (permissions)
4. Note: This is a graceful degradation - analysis still works without spec context
5. Check server logs for file system errors

### "Invalid Spec Path" Error

**Problem**: Path validation fails with "Invalid spec path" error

**Solution**:
1. Don't use absolute paths (e.g., "/usr/local/specs")
2. Don't use ".." for parent directory traversal
3. Use relative paths only (e.g., "001-voice-dictation")
4. Paths are automatically joined with "specs/" directory

---

## Performance Tips

### 1. Validate Before API Call

```typescript
// Prevent unnecessary API calls
const wordCount = transcript.split(/\s+/).length
if (wordCount < 10) {
  alert('Transcript too short to analyze meaningfully.')
  return
}
```

### 2. Debounce Rapid Clicks

```typescript
import { useState, useCallback } from 'react'

function AnalyzeButton() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = useCallback(async () => {
    if (isAnalyzing) return  // Prevent double-clicks

    setIsAnalyzing(true)
    try {
      await analyzeNote(noteId)
    } finally {
      setIsAnalyzing(false)
    }
  }, [isAnalyzing, noteId])

  return <button onClick={handleAnalyze} disabled={isAnalyzing}>
    {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
  </button>
}
```

### 3. Cache Analysis Results

```typescript
// Zustand store automatically persists to LocalStorage
// Analysis remains available across sessions
const { notes } = useStore()
const analyzedNote = notes.find(n => n.id === noteId && n.analysis)

if (analyzedNote?.analysis) {
  // Show cached result instead of re-analyzing
  return <AnalysisResult analysis={analyzedNote.analysis} />
}
```

---

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

### 2. Create Test Notes

Use the Voice Dictation MVP to create test notes with:
- Clear decisions (good for testing)
- Mixed brainstorming and decisions (tests filtering)
- No decisions (tests edge case)
- Very long content (tests length validation)

### 3. Test Analysis Modes

```typescript
// Test each mode
await analyzeNote(noteId, 'technical')  // Technical decisions
await analyzeNote(noteId, 'actions')    // Action items
await analyzeNote(noteId, 'summary')    // Full summary
```

### 4. Test Error Scenarios

1. Remove API key → Test missing API key error
2. Spam analyze button → Test rate limit handling
3. Analyze empty note → Test validation
4. Analyze very long note → Test length limit

### 5. Check LocalStorage

```javascript
// Browser console
const storage = JSON.parse(localStorage.getItem('voice-dictation-storage'))
console.log(storage.state.notes)
```

Verify notes have `analysis` field after analysis.

---

## Next Steps

After quickstart:

1. **Read Full Documentation**:
   - [research.md](./research.md) - Technical decisions
   - [data-model.md](./data-model.md) - Entity definitions
   - [contracts/](./contracts/) - Component specifications

2. **Run Tests** (when implemented):
   ```bash
   npm test
   ```

3. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

4. **Deploy**:
   - Add `ANTHROPIC_API_KEY` to production environment variables
   - Verify Vercel/Netlify deployment
   - Test in production environment

---

## Support

### Documentation
- [Anthropic API Docs](https://platform.claude.com/docs/en/api)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Zustand Persist](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)

### Issues
- Check [GitHub Issues](https://github.com/Ne4nf/Speech-To-Text/issues)
- Review [Constitution](../../.specify/memory/constitution.md) for architectural guidelines

### Contributing
- Follow [Constitutional Compliance](../../.specify/memory/constitution.md)
- Maintain [Accessibility Standards](../../.specify/memory/constitution.md#v-accessibility-first)
- Adhere to [Privacy by Design](../../.specify/memory/constitution.md#iii-privacy-by-design)

---

**Happy analyzing! 🎉**

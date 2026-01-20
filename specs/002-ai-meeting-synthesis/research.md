# Technical Research: AI Meeting Synthesis Agent

**Feature**: 002-ai-meeting-synthesis
**Date**: 2026-01-16
**Status**: Complete

---

## Overview

This document consolidates technical research for implementing AI-powered transcript analysis in the Voice Dictation application using Next.js 14 Server Actions and Anthropic Claude API.

---

## 1. Anthropic API Integration

### Decision: Use Official Anthropic TypeScript SDK

**Choice**: `@anthropic-ai/sdk` (v0.71.2+) - Official TypeScript library

**Rationale**:
- First-party support from Anthropic
- Type-safe TypeScript definitions
- Built-in error handling for rate limits and timeouts
- Regular updates with new Claude model features
- Excellent documentation and community support

**Alternatives Considered**:
- **@ai-sdk/anthropic**: Vercel's AI SDK (rejected - additional abstraction layer not needed)
- **Direct REST API calls**: Rejected - manual error handling and type safety concerns

### Implementation Pattern

**Server Action Structure**:
```typescript
// app/actions/analyze-transcript.ts
'use server';

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeTranscript(transcript: string) {
  // Implementation with error handling
}
```

**Security Considerations**:
- API key stored in `ANTHROPIC_API_KEY` environment variable (server-only)
- No `NEXT_PUBLIC_` prefix (prevents client-side exposure)
- Server Actions automatically encrypt closed-over variables
- Input validation before API calls

**Sources**:
- [Anthropic TypeScript SDK Documentation](https://platform.claude.com/docs/en/api/client-sdks)
- [Next.js Server Actions Security](https://nextjs.org/docs/app/guides/data-security)
- [Environment Variables Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## 1.5. Reading Local Spec Files via Server Actions

### Decision: Use Node.js `fs` Module in Server Actions

**Pattern**: Server-side file system access for reading project specification files

**Rationale**:
- Next.js Server Actions run server-side where Node.js `fs` module is available
- Keeps file paths secure (no client-side exposure of server directory structure)
- Allows AI to cross-reference transcript with project spec for context-aware analysis
- No external API calls required (faster, more reliable)
- Graceful degradation if spec files missing or unreadable

### Implementation Pattern

**Server Action for File Reading**:
```typescript
// app/actions/read-spec-file.ts
'use server';

import { readFile } from 'fs/promises';
import { join } from 'path';

export async function readSpecFile(specPath: string): Promise<string | null> {
  try {
    // Security: Validate path is within specs/ directory
    const fullPath = join(process.cwd(), 'specs', specPath, 'spec.md');

    // Read file contents
    const content = await readFile(fullPath, 'utf-8');

    return content;
  } catch (error) {
    // Graceful degradation: return null if file not found
    console.error('Failed to read spec file:', error);
    return null;
  }
}
```

**Integration with Analysis Action**:
```typescript
// app/actions/analyze-transcript.ts
'use server';

import Anthropic from '@anthropic-ai/sdk';
import { readSpecFile } from './read-spec-file';

export async function analyzeTranscript(
  transcript: string,
  specPath?: string
) {
  // Read spec file if path provided
  let specContent = '';
  if (specPath) {
    specContent = await readSpecFile(specPath) || '';
  }

  // Enhanced prompt with spec context
  const systemPrompt = specContent
    ? `You are analyzing a meeting transcript. Here is the current project specification for context:\n\n${specContent}\n\n...`
    : 'You are analyzing a meeting transcript...';

  // Call Anthropic API with both transcript and spec
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    system: systemPrompt,
    messages: [{ role: 'user', content: transcript }]
  });

  return message;
}
```

### Security Considerations

**Path Traversal Prevention**:
- Validate `specPath` parameter to prevent directory traversal attacks
- Only allow paths within `specs/` directory
- Use `join()` to construct safe file paths
- Reject paths containing `..` or absolute paths

**Error Handling**:
- Catch `ENOENT` (file not found) errors gracefully
- Return `null` if file unreadable (FR-024: graceful degradation)
- Log errors server-side (no sensitive info in client responses)
- Don't expose server directory structure in error messages

### Performance Considerations

**File Size Limits**:
- Spec files typically < 50KB (reasonable for LLM context)
- Add validation: reject spec files > 500KB
- Cache spec file content in memory if repeatedly accessed

**Async Operations**:
- `readFile()` is non-blocking (I/O doesn't block event loop)
- Parallel file reading and API validation for faster response
- Timeout after 5 seconds for file reads

### Alternative Approaches

**Alternatives Considered**:
- **Client-side file upload**: Rejected - requires user action, breaks workflow
- **Database storage**: Rejected - adds complexity, not needed for local files
- **External API calls**: Rejected - slower, less reliable, adds dependency

**Sources**:
- [Next.js Server Actions File System](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Node.js fs Module Documentation](https://nodejs.org/api/fs.html)
- [Path Traversal Prevention](https://nodejs.org/api/path.html#pathjoinpaths)

---

## 2. Error Handling & Resilience

### Decision: Retry Logic with Exponential Backoff

**Pattern**: Handle rate limits (429 errors) with intelligent retries

**Implementation**:
```typescript
async function analyzeWithRetry(transcript: string, maxRetries = 5) {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await analyzeTranscript(transcript);
    } catch (error: any) {
      attempt++;

      if (error.status === 429) {
        const retryAfter = error.headers?.get('retry-after');
        const delay = retryAfter
          ? parseInt(retryAfter) * 1000
          : 1000 * Math.pow(2, attempt) + Math.random() * 1000;

        if (attempt >= maxRetries) {
          throw new Error('Max retries exceeded');
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }
}
```

**Error Categories**:
1. **Retryable**: Rate limits (429), transient network errors (5xx)
2. **Non-retryable**: Authentication errors (401), invalid input (400), not found (404)
3. **Graceful degradation**: API key missing, service unavailable

**User-Facing Error Messages**:
- No API key: "AI analysis requires an API key. Please add ANTHROPIC_API_KEY to environment variables."
- Rate limit: "Too many requests. Please wait a moment and try again."
- Service unavailable: "AI service is temporarily unavailable. Please try again later."
- Transcript too long: "Transcript exceeds maximum length. Please split into smaller notes."

**Sources**:
- [Anthropic API Error Handling](https://platform.claude.com/docs/en/api/errors)
- [Retry Pattern Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

---

## 3. Prompt Engineering for Decision Extraction

### Decision: Structured System Prompt with JSON Output

**System Prompt Strategy**:
```
You are an expert meeting analyst specializing in extracting formal decisions from meeting transcripts.

GUIDELINES:
- DECISIONS: Extract only final, binding decisions (not discussions or options)
- FILTER: Remove all brainstorming, hypothetical scenarios, and exploratory discussions
- FORMAT: Provide clear, actionable decision summaries with specific outcomes
- CONTEXT: Include only decisions that commit to action or change
- EXCLUSIONS: Exclude "we should", "maybe", "let's consider" type statements

Output structure:
1. Decisions with: title, description, priority, assignee, deadline
2. Filtered brainstorming points (for transparency)
3. Executive summary of key decisions
```

**User Prompt Template**:
```
Analyze this meeting transcript and extract final decisions:

${transcript}

Focus on extracting ONLY the final decisions made, filtering out all brainstorming content.

Provide decisions in the specified JSON format.
```

**Prompt Engineering Techniques**:
1. **Role specification**: "expert meeting analyst" establishes context
2. **Explicit guidelines**: Clear distinction between decisions vs. discussions
3. **Examples**: Provide few-shot examples of what constitutes a decision
4. **Output format**: Structured JSON with schema validation
5. **Temperature**: Low temperature (0.3) for consistent, focused outputs

**Example Output Schema**:
```typescript
{
  decisions: [
    {
      title: "Migrate database from MySQL to Redis",
      description: "Final decision to switch primary data store for better performance",
      priority: "high",
      assignedTo: "Infrastructure Team",
      deadline: "Q2 2026"
    }
  ],
  filteredBrainstorming: [
    "Maybe we could consider PostgreSQL instead",
    "I wonder if MongoDB would work better"
  ],
  summary: "Key decision made to migrate to Redis for improved caching performance"
}
```

**Sources**:
- [Anthropic Prompt Engineering Guide](https://platform.claude.com/docs/en/prompt-engineering)
- [Few-Shot Prompting Patterns](https://platform.claude.com/docs/en/prompt-engineering#few-shot-prompting)
- [JSON Output with Claude](https://platform.claude.com/docs/en/prompt-engineering#json-output)

---

## 4. Markdown Rendering & Display

### Decision: React-Markdown with Custom Components

**Choice**: `react-markdown` (v9+) with syntax highlighting

**Rationale**:
- Pure TypeScript/React (no build-time transformation needed)
- Custom component support for code blocks, lists, etc.
- XSS protection built-in
- Server-side rendering compatible
- Tailwind CSS integration

**Installation**:
```bash
npm install react-markdown remark-gfm
```

**Implementation**:
```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function AnalysisResult({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({children}) => (
            <h2 className="text-xl font-semibold text-gray-800 mt-4 mb-2">
              {children}
            </h2>
          ),
          ul: ({children}) => (
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {children}
            </ul>
          ),
          blockquote: ({children}) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600">
              {children}
            </blockquote>
          )
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
```

**Visual Distinction Strategy**:
- Raw transcript: Monospace font, gray background, "transcript" label
- AI analysis: Sans-serif font, white background, border, "AI Analysis" badge
- Timestamp: Small text below analysis showing when generated

**Sources**:
- [React-Markdown Documentation](https://github.com/remarkjs/react-markdown)
- [Tailwind Typography Plugin](https://tailwindcss.com/docs/typography-plugin)

---

## 5. Zustand Store Extension

### Decision: Extend Existing Note Entity

**Current Note Structure** (from SpecLedger-06k):
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
  id: string
  content: string
  createdAt: number
  language: Language
  analysis?: {
    content: string        // Markdown formatted analysis
    analyzedAt: number     // Timestamp when analysis was generated
    mode: AnalysisMode    // 'technical' | 'actions' | 'summary'
  }
}

type AnalysisMode = 'technical' | 'actions' | 'summary';
```

**Store Actions**:
```typescript
interface StoreState {
  // ... existing actions

  // New AI analysis actions
  analyzeNote: (noteId: string) => Promise<void>
  updateNoteAnalysis: (noteId: string, analysis: string, mode: AnalysisMode) => void
  clearNoteAnalysis: (noteId: string) => void
  isAnalyzing: boolean
  analysisError: string | null
}
```

**Persistence Strategy**:
- Use existing Zustand persist middleware
- Analysis stored alongside note in LocalStorage
- No additional storage configuration needed
- Automatic persistence on state changes

**Sources**:
- [Zustand Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [Existing Store Implementation](../../001-voice-dictation/data-model.md)

---

## 6. Performance & Optimization

### Transcript Length Validation

**Constraint**: Anthropic API has token limits per request
- **Claude 3.5 Sonnet**: 200K tokens max (~150K words)
- **Practical limit**: 2000 words per transcript (from spec SC-007)

**Validation Strategy**:
```typescript
const MAX_TRANSCRIPT_WORDS = 2000;

function validateTranscriptLength(transcript: string): {
  valid: boolean
  wordCount: number
  error?: string
} {
  const wordCount = transcript.split(/\s+/).length;

  if (wordCount > MAX_TRANSCRIPT_WORDS) {
    return {
      valid: false,
      wordCount,
      error: `Transcript too long (${wordCount} words). Maximum ${MAX_TRANSCRIPT_WORDS} words.`
    };
  }

  return { valid: true, wordCount };
}
```

**User Feedback**:
- Show word count when analysis is clicked
- Suggest splitting if over limit
- Provide progress indicator for long analyses

### Loading States

**UI Pattern**:
1. Initial state: "Analyze with AI" button
2. Loading state: Spinner + "Analyzing..." text (disable button)
3. Success state: Show analysis result
4. Error state: Show error message + "Retry" button

**Concurrent Analysis Prevention**:
```typescript
// Store state
isAnalyzing: boolean
analyzingNoteId: string | null

// Action
analyzeNote: async (noteId: string) => {
  if (get().isAnalyzing) {
    throw new Error('Analysis already in progress');
  }

  set({ isAnalyzing: true, analyzingNoteId: noteId });

  try {
    // ... analysis logic
  } finally {
    set({ isAnalyzing: false, analyzingNoteId: null });
  }
}
```

**Sources**:
- [Claude Model Context Windows](https://platform.claude.com/docs/en/models)
- [React Loading State Patterns](https://react.dev/learn/keeping-components-pure)

---

## 7. Environment Configuration

### Decision: Server-Only Environment Variables

**.env.local** (not committed to git):
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

**.env.example** (committed to git):
```bash
# Anthropic API Key for AI transcript analysis
# Get your key at: https://console.anthropic.com/
ANTHROPIC_API_KEY=your_api_key_here
```

**Next.js Configuration** (next.config.js):
```javascript
module.exports = {
  env: {
    // No NEXT_PUBLIC_ prefix - keeps variables server-only
  },
}
```

**Validation**:
```typescript
// app/actions/analyze-transcript.ts
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}
```

**Development vs Production**:
- **Development**: Use `.env.local` for testing
- **Production**: Use cloud provider environment variables (Vercel, Netlify, etc.)
- **CI/CD**: Store in repository secrets

**Sources**:
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Anthropic API Keys](https://console.anthropic.com/settings/keys)

---

## 8. Accessibility Considerations

### Decision: WCAG 2.1 AA Compliance

**Keyboard Navigation**:
- "Analyze" button accessible via Tab and Enter/Space
- Analysis result focusable and scrollable
- Escape key closes/dismisses analysis

**Screen Reader Support**:
```typescript
<button
  onClick={handleAnalyze}
  aria-label={`Analyze note with AI. Note content: ${note.content.slice(0, 50)}...`}
  aria-busy={isAnalyzing}
  disabled={isAnalyzing}
>
  {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
</button>
```

**Visual Feedback**:
- Loading spinner with `aria-live="polite"`
- Error messages with `role="alert"`
- Success indicator when analysis complete

**Color Contrast**:
- Analysis result: Dark text on light background (4.5:1 contrast)
- Error messages: Red icon with text (WCAG AA compliant)
- Links/highlights: Blue with sufficient contrast

**Sources**:
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Best Practices](https://www.w3.org/WAI/ARIA/apg/)

---

## 9. Testing Strategy

### Decision: Mock Anthropic API for Tests

**Mocking Approach**:
```typescript
// __mocks__/@anthropic-ai/sdk.ts
export default class Anthropic {
  constructor(options: any) {}

  async messages() {
    return {
      create: async () => ({
        content: [{ text: JSON.stringify(mockAnalysisResponse) }]
      })
    };
  }
}
```

**Test Scenarios**:
1. Successful analysis with valid transcript
2. Error handling for missing API key
3. Rate limit error handling
4. Empty transcript handling
5. Transcript too long handling
6. Concurrent analysis prevention
7. Analysis persistence across refresh

**Testing Tools**:
- Vitest for unit tests
- React Testing Library for component tests
- MSW (Mock Service Worker) for API mocking

**Sources**:
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW for API Mocking](https://mswjs.io/)

---

## 10. Implementation Dependencies

### Required Packages

**Core Dependencies**:
```json
{
  "@anthropic-ai/sdk": "^0.71.2",
  "react-markdown": "^9.0.0",
  "remark-gfm": "^4.0.0",
  "zod": "^3.22.0"  // For response validation
}
```

**Already Installed** (from SpecLedger-06k):
- Next.js 14.1+
- React 18+
- Zustand 4.5+ (with persist middleware)
- Tailwind CSS 3.4+
- Lucide React 0.300+

**Installation Command**:
```bash
npm install @anthropic-ai/sdk react-markdown remark-gfm zod
```

**Sources**:
- [Package Documentation](https://www.npmjs.com/)
- [Existing Dependencies](../../001-voice-dictation/plan.md)

---

## Summary of Technical Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **API SDK** | @anthropic-ai/sdk | Official TypeScript support, type safety |
| **Server Actions** | Next.js built-in | Secure API key handling, no extra infrastructure |
| **Error Handling** | Retry with exponential backoff | Handles rate limits gracefully |
| **Prompt Strategy** | Structured JSON output | Consistent parsing, validation with Zod |
| **Markdown Rendering** | react-markdown | SSR compatible, Tailwind integration |
| **State Management** | Extend Zustand store | Reuse existing persistence, minimal changes |
| **Environment Variables** | Server-only only | Secure by default, no client exposure |
| **Accessibility** | WCAG 2.1 AA | Constitutional requirement |
| **Testing** | Mock API responses | Fast, reliable tests without real API calls |

---

## Prior Work Integration

This feature builds directly on the Voice Dictation MVP (SpecLedger-06k):

**Reusing**:
- Zustand store with persist middleware
- Note entity and LocalStorage schema
- Component structure (NoteSidebar, SaveNoteButton)
- Tailwind CSS styling system
- TypeScript configuration

**Extending**:
- Note entity with `analysis` field
- Store with `analyzeNote`, `updateNoteAnalysis` actions
- NoteSidebar with "Analyze" button per note
- New components for displaying analysis results

**No Conflicts**:
- AI features are opt-in (constitutional requirement)
- Core voice dictation remains functional without AI
- No breaking changes to existing components or data model

---

## Next Steps

1. **Phase 1**: Create detailed data model with TypeScript interfaces
2. **Phase 1**: Define component contracts for UI elements
3. **Phase 1**: Generate quickstart guide for developers
4. **Phase 2**: Create task breakdown with Beads
5. **Implementation**: Follow task order from tasks.md

**All technical unknowns resolved.** Ready to proceed to Phase 1 (Design & Contracts).

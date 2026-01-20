# Component Contract: AnalysisResult

**Component**: `components/AnalysisResult.tsx`
**Feature**: 002-ai-meeting-synthesis
**User Story**: US1 (Analyze Transcript with AI)
**Priority**: P1

---

## Purpose

Displays AI-generated analysis results in a visually distinct card with Markdown rendering, timestamp, and dismiss functionality.

---

## Props Interface

```typescript
interface AnalysisResultProps {
  analysis: NoteAnalysis         // Analysis result to display
  onDismiss?: () => void         // Optional callback to dismiss/hide result
  onReanalyze?: () => void       // Optional callback to trigger re-analysis
  className?: string             // Additional CSS classes (optional)
}
```

---

## Behavior Specification

### Visual Distinction from Raw Transcript

**Layout**:
- Background: White (`bg-white`)
- Border: Left border accent (4px solid blue/purple gradient)
- Shadow: Subtle elevation (`shadow-md`)
- Padding: Comfortable spacing (`p-4`)
- Border radius: Rounded corners (`rounded-lg`)

**Header Section**:
- Title: "AI Analysis" badge
- Icon: Brain/sparkles icon (Lucide `Brain` or `Sparkles`)
- Timestamp: "Analyzed {time ago}" (relative time)
- Re-analyze button: Small icon button (optional)

**Content Section**:
- Markdown rendered with Tailwind typography (`prose`)
- Font: Sans-serif (Inter/system-ui)
- Color: Dark gray text (`text-gray-800`)
- Line height: 1.6 for readability

**Footer Section** (if onDismiss provided):
- Dismiss button: "Close" or "×" icon
- Alignment: Right-aligned
- Color: Gray (`text-gray-500`)

### Markdown Rendering

**Supported Elements**:
- Headings (H2, H3) - Styled with Tailwind typography
- Lists (UL, OL) - Proper indentation and spacing
- Bold/Italic - Emphasis preserved
- Blockquotes - Styled with left border and italic
- Code blocks - Monospace font with gray background (if present)

**Custom Styling**:
```typescript
<ReactMarkdown
  components={{
    h2: ({children}) => (
      <h2 className="text-xl font-semibold text-gray-800 mt-4 mb-2">
        {children}
      </h2>
    ),
    h3: ({children}) => (
      <h3 className="text-lg font-medium text-gray-800 mt-3 mb-2">
        {children}
      </h3>
    ),
    ul: ({children}) => (
      <ul className="list-disc list-inside space-y-1 text-gray-700">
        {children}
      </ul>
    ),
    blockquote: ({children}) => (
      <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 my-2">
        {children}
      </blockquote>
    ),
    p: ({children}) => (
      <p className="text-gray-700 mb-2">{children}</p>
    ),
    strong: ({children}) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    )
  }}
>
  {analysis.content}
</ReactMarkdown>
```

### Dismiss Behavior

**When Dismissed**:
1. Calls `onDismiss()` callback
2. Parent component hides/removes the result
3. Analysis remains in store (not deleted)
4. User can re-open by clicking indicator in sidebar

**Re-analyze Behavior** (if onReanalyze provided):
1. Small "Refresh" icon button in header
2. Calls `onReanalyze()` callback
3. Triggers new analysis with same mode
4. Replaces existing result when complete

---

## Accessibility Requirements

### Keyboard Navigation
- **Focusable**: Dismiss/re-analyze buttons (tab index = 0)
- **Enter/Space**: Triggers button callbacks
- **Escape**: Dismisses result (if onDismiss provided)

### Screen Reader Support
```typescript
<div
  role="region"
  aria-labelledby="analysis-title"
  aria-label="AI analysis result"
>
  <h2 id="analysis-title">AI Analysis</h2>
  <time dateTime={new Date(analysis.analyzedAt).toISOString()}>
    Analyzed {formatDistanceToNow(analysis.analyzedAt)} ago
  </time>
  <div className="prose" role="article">
    <ReactMarkdown>{analysis.content}</ReactMarkdown>
  </div>
  <button
    onClick={onDismiss}
    aria-label="Close analysis result"
  >
    <X />
  </button>
</div>
```

### Focus Management
- When result appears: Focus on dismiss button (optional, for keyboard users)
- When dismissed: Focus returns to trigger button
- Tab order: Header → Content → Footer buttons

---

## Styling Specifications

### Tailwind Classes

**Container**:
```tsx
<div className="bg-white rounded-lg shadow-md border-l-4 border-purple-500 p-4 my-4">
```

**Header**:
```tsx
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-2">
    <Brain className="w-5 h-5 text-purple-600" />
    <h3 className="text-lg font-semibold text-gray-800">
      AI Analysis
    </h3>
    <span className="text-xs text-gray-500">
      ({formatDistanceToNow(analysis.analyzedAt, { addSuffix: true })})
    </span>
  </div>
  <button
    onClick={onReanalyze}
    aria-label="Re-analyze note"
    className="p-1 hover:bg-gray-100 rounded"
  >
    <RefreshCw className="w-4 h-4 text-gray-600" />
  </button>
</div>
```

**Content**:
```tsx
<div className="prose prose-sm max-w-none text-gray-800">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {analysis.content}
  </ReactMarkdown>
</div>
```

**Footer (Dismiss)**:
```tsx
<div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
  <button
    onClick={onDismiss}
    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
  >
    <X className="w-4 h-4" />
    Close
  </button>
</div>
```

### Responsive Design
- **Mobile**: Stack header elements, smaller text (`text-base`), full width
- **Desktop**: Horizontal header, larger text (`text-lg`), max-width container
- **Breakpoint**: `md:` prefix for desktop overrides

---

## Error Handling

### Malformed Markdown
- **Fallback**: Display raw text if Markdown parsing fails
- **User Message**: "Analysis format error" (if parsing throws)
- **Error Boundary**: Wrap component in error boundary to catch rendering errors

```typescript
try {
  return <ReactMarkdown>{analysis.content}</ReactMarkdown>
} catch (error) {
  return (
    <div className="text-red-500">
      Analysis format error. Please re-analyze.
    </div>
  )
}
```

### Empty Analysis
```typescript
if (!analysis.content || analysis.content.trim().length === 0) {
  return (
    <div className="text-gray-500 italic">
      Analysis produced no results. The transcript may contain no clear decisions.
    </div>
  )
}
```

---

## Integration Example

```typescript
import { AnalysisResult } from '@/components/AnalysisResult'
import { useStore } from '@/store/useStore'
import { formatDistanceToNow } from 'date-fns'

function NoteWithAnalysis({ note }: { note: Note }) {
  const [showAnalysis, setShowAnalysis] = useState(true)
  const { analyzeNote, clearNoteAnalysis } = useStore()

  if (!note.analysis || !showAnalysis) {
    return null
  }

  const handleReanalyze = async () => {
    await analyzeNote(note.id, note.analysis.mode)
  }

  const handleDismiss = () => {
    setShowAnalysis(false)
  }

  return (
    <AnalysisResult
      analysis={note.analysis}
      onDismiss={handleDismiss}
      onReanalyze={handleReanalyze}
      className="my-4"
    />
  )
}
```

---

## Performance Considerations

### Markdown Rendering
- **Lazy Loading**: Load `react-markdown` and `remark-gfm` dynamically if needed
- **Memoization**: Memoize Markdown content to prevent re-renders
- **Virtual Scrolling**: For very long results (unlikely, but consider)

### Re-render Optimization
```typescript
const MemoizedAnalysisResult = React.memo(AnalysisResult)

// Only re-renders when analysis.content changes
<MemoizedAnalysisResult analysis={note.analysis} />
```

### Bundle Size Impact
- `react-markdown`: ~15KB gzipped
- `remark-gfm`: ~3KB gzipped
- Total: ~18KB additional (acceptable for functionality)

---

## Testing Strategy

### Unit Tests
1. **Render** with different analysis content
2. **Markdown parsing** with various formats
3. **Dismiss** callback triggered on button click
4. **Re-analyze** callback triggered on button click
5. **Timestamp** displays correctly

### Integration Tests
1. Display analysis result from store
2. Dismiss hides result (doesn't delete from store)
3. Re-analyze triggers new analysis with same mode
4. Markdown renders correctly with Tailwind styles

### Accessibility Tests
1. Screen reader announces "AI Analysis" title
2. Timestamp announced in human-readable format
3. Dismiss button accessible via keyboard
4. Escape key dismisses result
5. Focus management works correctly

---

## Dependencies

**Required**:
- `react-markdown`: Markdown rendering
- `remark-gfm`: GitHub Flavored Markdown support
- `date-fns`: Timestamp formatting (already in project)
- `lucide-react`: Icons (Brain, RefreshCw, X)

**TypeScript Types**:
```typescript
import type { NoteAnalysis } from '@/types'
```

---

## Success Criteria

**Functional Requirements Met**:
- ✅ FR-004: Display AI analysis results as structured Markdown
- ✅ FR-011: Visual distinction between raw transcript and AI summary
- ✅ FR-018: Format output as structured Markdown with clear sections
- ✅ FR-019: Include timestamp showing when analysis was generated
- ✅ FR-020: Allow users to dismiss or minimize the AI analysis view

**Accessibility Met**:
- ✅ ARIA labels and roles for screen readers
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus indicators
- ✅ Timestamp in human-readable format

**Constitutional Compliance**:
- ✅ Accessibility First (ARIA, keyboard nav, WCAG AA contrast)
- ✅ Privacy by Design (clear visual indication of AI-generated content)
- ✅ Progressive Enhancement (degrades gracefully if Markdown fails)

---

## Related Components

- `AnalyzeButton.tsx`: Triggers analysis that results in this component
- `NoteSidebar.tsx`: Container for note cards with analysis results
- `TranscriptDisplay.tsx`: Shows raw transcript (visual distinction from this component)

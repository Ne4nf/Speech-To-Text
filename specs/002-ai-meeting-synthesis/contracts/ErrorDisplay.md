# Component Contract: ErrorDisplay

**Component**: `components/ErrorDisplay.tsx`
**Feature**: 002-ai-meeting-synthesis
**User Story**: US3 (Handle AI Service Errors)
**Priority**: P2

---

## Purpose

Displays user-friendly error messages when AI analysis fails, with clear explanations and actionable next steps.

---

## Props Interface

```typescript
interface ErrorDisplayProps {
  error: string | null           // Error message to display
  onRetry?: () => void           // Optional callback to retry failed operation
  onDismiss?: () => void         // Optional callback to dismiss error
  variant?: 'inline' | 'banner'  // Display variant (default: 'inline')
  className?: string             // Additional CSS classes (optional)
}
```

---

## Behavior Specification

### Display States

**1. No Error (error = null)**
- Component renders nothing (null return)
- No visual footprint

**2. Error Present**
- Visible error message displayed
- Red/warning color scheme
- Icon indicating error type
- Retry button (if onRetry provided)
- Dismiss button (if onDismiss provided)

### Error Categories

**API Key Missing**:
```typescript
if (error.includes('API key') || error.includes('ANTHROPIC_API_KEY')) {
  icon: 'Key' (Lucide)
  message: "AI analysis requires an API key"
  details: "Please add ANTHROPIC_API_KEY to environment variables and restart the server."
}
```

**Rate Limit Exceeded**:
```typescript
if (error.includes('rate limit') || error.includes('429')) {
  icon: 'Clock' (Lucide)
  message: "Too many requests"
  details: "Please wait a moment and try again."
}
```

**Service Unavailable**:
```typescript
if (error.includes('unavailable') || error.includes('503')) {
  icon: 'AlertCircle' (Lucide)
  message: "AI service is temporarily unavailable"
  details: "Please try again later."
}
```

**Transcript Too Long**:
```typescript
if (error.includes('too long') || error.includes('word count')) {
  icon: 'FileText' (Lucide)
  message: "Transcript exceeds maximum length"
  details: "Maximum 2000 words. Please split into smaller notes."
}
```

**Generic Error**:
```typescript
icon: 'AlertTriangle' (Lucide)
message: "Analysis failed"
details: error.message || "An unexpected error occurred. Please try again."
}
```

### Variants

**Inline (default)**:
- Compact display
- Fits within card/component
- Red border on left
- Gray background

**Banner**:
- Full-width display
- Fixed positioning at top of page
- Red background with white text
- Dismissible

---

## Accessibility Requirements

### Keyboard Navigation
- **Focusable**: Retry/dismiss buttons (tab index = 0)
- **Enter/Space**: Triggers button callbacks
- **Escape**: Dismisses error (if onDismiss provided)

### Screen Reader Support
```typescript
<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
>
  <div className="flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />
    <div className="flex-1">
      <h3 className="font-semibold text-red-900">{title}</h3>
      <p className="text-red-800">{details}</p>
      <div className="mt-2 flex gap-2">
        {onRetry && (
          <button onClick={onRetry} className="underline">
            Try again
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="underline">
            Dismiss
          </button>
        )}
      </div>
    </div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="p-1 hover:bg-red-100 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
</div>
```

### Focus Management
- When error appears: Focus on retry button (if present)
- When dismissed: Focus returns to trigger button
- Banner variant: Prevents page scroll when focused

---

## Styling Specifications

### Tailwind Classes

**Inline Variant**:
```tsx
<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg my-4">
  <div className="flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <h3 className="font-semibold text-red-900 text-sm">{title}</h3>
      <p className="text-red-800 text-sm mt-1">{details}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="p-1 hover:bg-red-100 rounded transition-colors"
      >
        <X className="w-4 h-4 text-red-600" />
      </button>
    )}
  </div>
</div>
```

**Banner Variant**:
```tsx
<div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-4 shadow-lg z-50">
  <div className="max-w-7xl mx-auto flex items-center justify-between">
    <div className="flex items-center gap-3">
      <AlertCircle className="w-5 h-5" aria-hidden="true" />
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-red-100 text-sm">{details}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 bg-white text-red-600 text-sm rounded hover:bg-red-50 transition-colors"
        >
          Try Again
        </button>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="p-1 hover:bg-red-700 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
</div>
```

### Color Schemes

| Error Type | Background | Border/Icon | Text |
|------------|------------|-------------|------|
| API Key Missing | Red-50 | Red-500 | Red-900/800 |
| Rate Limit | Yellow-50 | Yellow-500 | Yellow-900/800 |
| Service Unavailable | Orange-50 | Orange-500 | Orange-900/800 |
| Generic Error | Red-50 | Red-500 | Red-900/800 |

---

## Error Message Patterns

### API Key Missing
```typescript
{
  title: "API Key Required",
  details: "AI analysis requires an ANTHROPIC_API_KEY. Please add it to your environment variables and restart the server.",
  action: "Get API Key",
  actionUrl: "https://console.anthropic.com/settings/keys"
}
```

### Rate Limit
```typescript
{
  title: "Too Many Requests",
  details: "You've reached the rate limit. Please wait a moment and try again.",
  retryAfter: 60  // seconds
}
```

### Transcript Too Long
```typescript
{
  title: "Transcript Too Long",
  details: `This transcript has ${wordCount} words. Maximum is ${MAX_WORDS} words. Please split into smaller notes.`,
  suggestion: "Consider editing the note or creating multiple shorter notes."
}
```

### Service Unavailable
```typescript
{
  title: "Service Unavailable",
  details: "The AI service is temporarily unavailable. Please try again later.",
  retryable: true
}
```

---

## Integration Example

```typescript
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { useStore } from '@/store/useStore'

function NoteCard({ note }: { note: Note }) {
  const { analyzeNote, analysisError, setAnalysisError } = useStore()

  const handleAnalyze = async () => {
    setAnalysisError(null)
    try {
      await analyzeNote(note.id)
    } catch (error) {
      // Error already set in store
    }
  }

  return (
    <div>
      <p>{note.content}</p>

      {/* Analysis Error */}
      {analysisError && (
        <ErrorDisplay
          error={analysisError}
          onRetry={handleAnalyze}
          onDismiss={() => setAnalysisError(null)}
          variant="inline"
        />
      )}

      <button onClick={handleAnalyze}>
        Analyze with AI
      </button>
    </div>
  )
}
```

### Banner Variant (Global Errors)

```typescript
// app/layout.tsx or root component
function App() {
  const { globalError, clearGlobalError } = useStore()

  return (
    <>
      {globalError && (
        <ErrorDisplay
          error={globalError}
          onDismiss={clearGlobalError}
          variant="banner"
        />
      )}
      {/* Rest of app */}
    </>
  )
}
```

---

## Testing Strategy

### Unit Tests
1. **Render** with different error types
2. **Retry** callback triggered on button click
3. **Dismiss** callback triggered on button click
4. **Null error** returns nothing
5. **Banner variant** fixed positioning

### Integration Tests
1. Display error from store state
2. Retry re-triggers failed operation
3. Dismiss clears error from store
4. Banner displays at top of page
5. Error type detection works correctly

### Accessibility Tests
1. Screen reader announces error with `role="alert"`
2. Retry button accessible via keyboard
3. Escape key dismisses error (banner variant)
4. Focus management correct
5. Color contrast meets WCAG AA (4.5:1 for text)

---

## Performance Considerations

### Re-renders
- Only re-renders when error prop changes
- Memoize callbacks in parent: `useCallback(() => retry(), [retry])`

### Animation
- Fade-in animation for banner variant: `animate-fade-in`
- Slide-in from top: `transition-transform duration-300`

### Bundle Size
- Minimal: Uses existing Lucide icons
- No additional dependencies

---

## Dependencies

**Required**:
- `lucide-react`: Icons (AlertCircle, AlertTriangle, Key, Clock, FileText, X)

**TypeScript Types**:
```typescript
// No additional types needed
// error: string | null is sufficient
```

---

## Success Criteria

**Functional Requirements Met**:
- ✅ FR-012: Display clear error messages when AI service unavailable
- ✅ FR-013: Inform users when API key not configured
- ✅ FR-014: Handle analysis errors gracefully without breaking application
- ✅ FR-015: Validate transcript length before sending to API

**Accessibility Met**:
- ✅ ARIA live region (`role="alert"`) announces errors
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus indicators
- ✅ Clear, actionable error messages

**Constitutional Compliance**:
- ✅ Accessibility First (ARIA, keyboard nav, WCAG AA)
- ✅ Privacy by Design (error messages don't expose sensitive data)
- ✅ Simplicity & YAGNI (minimal dependencies, straightforward implementation)

---

## Related Components

- `AnalyzeButton.tsx`: May trigger errors that this component displays
- `NoteSidebar.tsx`: Container for error display in context of notes
- `AnalysisResult.tsx`: May have inline error display for rendering failures

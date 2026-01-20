# Component Contract: AnalyzeButton

**Component**: `components/AnalyzeButton.tsx`
**Feature**: 002-ai-meeting-synthesis
**User Story**: US1 (Analyze Transcript with AI)
**Priority**: P1

---

## Purpose

Button component that triggers AI analysis of a saved note. Displays loading state during analysis and error state on failure.

---

## Props Interface

```typescript
interface AnalyzeButtonProps {
  noteId: string                    // ID of note to analyze
  hasAnalysis: boolean              // Whether note already has analysis
  isAnalyzing: boolean              // Whether analysis is in progress
  isAnalyzingThisNote: boolean      // Whether THIS note is being analyzed
  onAnalyze: (noteId: string) => void  // Callback to trigger analysis
  disabled?: boolean                // External disabled state (optional)
  className?: string                // Additional CSS classes (optional)
}
```

---

## Behavior Specification

### States

**1. Idle (Not Analyzing, No Error)**
- Button shows: "Analyze with AI" text
- Icon: Sparkles icon (Lucide `Sparkles`)
- Background color: Purple/violet gradient
- Hover effect: Scale up slightly, brighter gradient
- Clickable: Yes
- ARIA: `aria-label="Analyze this note with AI"`

**2. Loading (Analysis In Progress)**
- Button shows: "Analyzing..." text
- Icon: Spinning loader (CSS animation)
- Background color: Gray (disabled appearance)
- Hover effect: None (disabled state)
- Clickable: No
- ARIA: `aria-busy="true"`, `aria-label="Analyzing note with AI, please wait"`

**3. Has Analysis (Note Already Analyzed)**
- Button shows: "Re-analyze" text
- Icon: Refresh icon (Lucide `RefreshCw`)
- Background color: Blue gradient
- Hover effect: Scale up slightly
- Clickable: Yes
- ARIA: `aria-label="Re-analyze this note with AI"`

**4. Disabled (External Disabled State)**
- Visual: Grayed out, opacity reduced
- Clickable: No
- ARIA: `aria-disabled="true"`

### Interactions

**On Click (When Enabled)**:
1. Call `onAnalyze(noteId)` callback
2. Transition to loading state immediately
3. Parent component handles API call and state updates

**On Disabled Click**:
- No action
- Visual feedback already shows disabled state

---

## Accessibility Requirements

### Keyboard Navigation
- **Focusable**: Yes (tab index = 0)
- **Enter/Space**: Triggers `onAnalyze` callback
- **Focus Ring**: Visible purple ring (2px, `ring-purple-500`)

### Screen Reader Support
```typescript
<button
  onClick={() => onAnalyze(noteId)}
  disabled={isAnalyzing || disabled}
  aria-label={
    hasAnalysis
      ? "Re-analyze this note with AI"
      : "Analyze this note with AI"
  }
  aria-busy={isAnalyzingThisNote}
  aria-describedby={
    hasAnalysis ? "analysis-timestamp" : undefined
  }
>
  {isAnalyzingThisNote ? (
    <>
      <Loader className="animate-spin" />
      Analyzing...
    </>
  ) : hasAnalysis ? (
    <>
      <RefreshCw />
      Re-analyze
    </>
  ) : (
    <>
      <Sparkles />
      Analyze with AI
    </>
  )}
</button>
```

### ARIA Live Regions
- When analysis completes: Parent component announces success
- When analysis fails: Error message announced via `role="alert"`

---

## Styling Specifications

### Tailwind Classes

**Idle State**:
```tsx
className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
```

**Loading State**:
```tsx
className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
```

**Has Analysis State**:
```tsx
className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200"
```

### Size Variants
- **Default**: `px-4 py-2` (medium)
- **Small**: `px-3 py-1.5 text-sm` (compact for mobile)
- **Large**: `px-6 py-3 text-lg` (prominent CTA)

---

## Error Handling

### Component Level
- Does not handle errors internally
- Parent component manages error state
- Displays error state via visual feedback (red border, shake animation)

### Error State Prop (Optional Enhancement)
```typescript
interface AnalyzeButtonProps {
  // ... existing props
  error?: string | null  // Error message to display
}

// Error state UI
{error && (
  <div className="text-red-500 text-sm mt-1" role="alert">
    {error}
  </div>
)}
```

---

## Integration Example

```typescript
import { AnalyzeButton } from '@/components/AnalyzeButton'
import { useStore } from '@/store/useStore'

function NoteCard({ note }: { note: Note }) {
  const { analyzeNote, isAnalyzing, analyzingNoteId, analysisError } = useStore()

  const handleAnalyze = async (noteId: string) => {
    try {
      await analyzeNote(noteId)
    } catch (error) {
      // Error handled by store
    }
  }

  return (
    <div>
      <p>{note.content}</p>
      <AnalyzeButton
        noteId={note.id}
        hasAnalysis={!!note.analysis}
        isAnalyzing={isAnalyzing}
        isAnalyzingThisNote={analyzingNoteId === note.id}
        onAnalyze={handleAnalyze}
      />
    </div>
  )
}
```

---

## Testing Strategy

### Unit Tests
1. **Render** with different props combinations
2. **Click** triggers `onAnalyze` callback with correct `noteId`
3. **Disabled** state prevents clicks
4. **Loading** state shows correct icon and text
5. **Has Analysis** state shows "Re-analyze" text

### Integration Tests
1. Click button → Store `analyzeNote` action called
2. Store updates to loading state → Button shows loading
3. Analysis completes → Button returns to has-analysis state
4. Analysis fails → Parent displays error message

### Accessibility Tests
1. Tab navigates to button
2. Enter/Space triggers callback
3. Screen reader announces correct label
4. Focus ring visible
5. `aria-busy` updates correctly during analysis

---

## Performance Considerations

### Re-renders
- Only re-renders when props change
- Memoize callback in parent: `useCallback(() => analyzeNote(id), [analyzeNote, id])`

### Icon Loading
- Use Lucide React (tree-shakeable)
- Icons loaded on-demand, no impact on initial bundle

### Animation Performance
- Use CSS transforms (`scale`) instead of layout properties
- `transition-all duration-200` for smooth state changes
- Loading spinner uses `animate-spin` (GPU-accelerated)

---

## Dependencies

**Required**:
- `lucide-react`: Icons (Sparkles, RefreshCw, Loader)
- Existing store: `useStore` from SpecLedger-06k

**Optional**:
- `clsx` or `classnames`: For conditional class merging (can use template literals)

---

## Success Criteria

**Functional Requirements Met**:
- ✅ FR-001: "Analyze with AI" button on each saved note
- ✅ FR-003: Loading indicator during analysis
- ✅ FR-016: Prevent concurrent analysis (disabled during loading)
- ✅ FR-020: Allow re-analysis (hasAnalysis state)

**Accessibility Met**:
- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ ARIA labels for screen readers
- ✅ Focus indicators
- ✅ Loading state announcements

**Constitutional Compliance**:
- ✅ Accessibility First (ARIA, keyboard nav)
- ✅ Progressive Enhancement (works without JS disabled degrades gracefully)
- ✅ Privacy by Design (opt-in, explicit user action)

---

## Related Components

- `AnalysisResult.tsx`: Displays analysis result (triggered after button click)
- `NoteSidebar.tsx`: Container for note cards with AnalyzeButton
- `ErrorDisplay.tsx`: Shows error messages (US3)

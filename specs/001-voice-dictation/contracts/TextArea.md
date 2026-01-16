# Component Contract: TextArea

**Feature**: 001-voice-dictation
**Component**: `TextArea`
**Status**: Draft

---

## Purpose

Real-time text display area that shows transcribed speech as user speaks. Updates dynamically during recording and displays finalized text.

---

## Props Interface

```typescript
interface TextAreaProps {
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  ariaLabel?: string
}
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string` | Yes | - | Current text content (transcript) |
| `onChange` | `(value: string) => void` | No | - | Callback when text changes (for future editing) |
| `placeholder` | `string` | No | `"Your speech will appear here..."` | Placeholder text when empty |
| `readOnly` | `boolean` | No | `true` | Prevent manual editing (MVP: read-only) |
| `ariaLabel` | `string` | No | `"Transcript"` | Accessibility label |

---

## Behavior

### User Interactions

| Action | Behavior |
|--------|----------|
| Typing | No effect in MVP (readOnly = true) |
| Focus | Focus ring visible |
| Scroll | Scrolls if content overflows |

### Visual States

| State | Appearance |
|-------|-----------|
| Default | Large textarea, light gray border |
| Focus | Blue border (2px), visible focus ring |
| Disabled | Not applicable in MVP |
| Error | Red border with error message (if recording error) |

### Real-Time Updates

```typescript
// Updates as speech is recognized
<TextArea
  value={recording.transcript + recording.interimTranscript}
  ariaLabel="Transcript"
/>
```

---

## Accessibility

### ARIA Attributes

```tsx
<div
  role="status"
  aria-live="polite"
  aria-label={ariaLabel}
>
  <textarea
    value={value}
    readOnly={readOnly}
    placeholder={placeholder}
  />
</div>
```

### Live Region

- **`role="status"`**: Indicates dynamic content region
- **`aria-live="polite"`**: Announces changes when user pauses
- **`aria-label`**: "Transcript" for screen readers

### Keyboard Navigation

- **Tab**: Focus textarea
- **Arrow Keys**: Navigate text (if not read-only)
- **Ctrl+A**: Select all (if not read-only)

---

## Dependencies

- **Styling**: Tailwind CSS classes

---

## Example Usage

```tsx
import { TextArea } from '@/components/TextArea'
import { useNoteStore } from '@/store/useNoteStore'

export function VoiceDictationApp() {
  const { recording } = useNoteStore()

  // Combine final transcript + interim text
  const displayText = recording.transcript + recording.interimTranscript

  return (
    <TextArea
      value={displayText}
      readOnly={true}
      placeholder="Your speech will appear here..."
    />
  )
}
```

---

## Constraints

- **Minimum Height**: 200px (per spec UI layout)
- **Minimum Width**: 100% (responsive)
- **Line Wrapping**: Soft wrap (textarea default)
- **Maximum Length**: No hard limit (practical limit per LocalStorage)
- **Font Size**: Minimum 16px (WCAG AA readable)

---

## Styling

### Tailwind Classes

```tsx
<textarea
  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-base resize-y"
  value={value}
  readOnly={readOnly}
  placeholder={placeholder}
/>
```

### Color Contrast

- **Background**: White (`#FFFFFF`)
- **Text**: Dark gray (`#111827`, Tailwind `gray-900`)
- **Border**: Light gray (`#D1D5DB`, Tailwind `gray-300`)
- **Focus Ring**: Blue (`#3B82F6`, Tailwind `blue-500`)
- **Contrast Ratio**: 16:1 (exceeds WCAG AA 4.5:1)

---

## Testing

### Unit Tests

```typescript
describe('TextArea', () => {
  it('displays the current transcript value')
  it('shows placeholder when value is empty')
  it('is read-only when readOnly prop is true')
  it('has correct ARIA attributes')
  it('applies focus styles on focus')
})
```

### Accessibility Tests

- Verify screen reader announces transcript updates
- Verify keyboard navigation works
- Verify focus ring visible
- Verify color contrast meets WCAG AA

---

## Future Enhancements

- Manual text editing capability
- Rich text formatting
- Export to file (TXT, PDF)
- Copy to clipboard button

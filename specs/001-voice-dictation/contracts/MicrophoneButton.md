# Component Contract: MicrophoneButton

**Feature**: 001-voice-dictation
**Component**: `MicrophoneButton`
**Status**: Draft

---

## Purpose

Prominent centered button that initiates and stops voice recording. Provides clear visual feedback (pulse animation) during active recording.

---

## Props Interface

```typescript
interface MicrophoneButtonProps {
  isRecording: boolean
  onStart: () => void
  onStop: () => void
  disabled?: boolean
  ariaLabel?: string
}
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isRecording` | `boolean` | Yes | - | Current recording state |
| `onStart` | `() => void` | Yes | - | Callback when user clicks to start recording |
| `onStop` | `() => void` | Yes | - | Callback when user clicks to stop recording |
| `disabled` | `boolean` | No | `false` | Disable button (e.g., unsupported browser) |
| `ariaLabel` | `string` | No | `"Start voice recording"` | Accessibility label |

---

## Behavior

### User Interactions

| Action | Behavior |
|--------|----------|
| Click (not recording) | Calls `onStart()`, browser requests mic permission |
| Click (recording) | Calls `onStop()`, stops recording session |
| Enter/Space key | Activates button (keyboard accessibility) |
| Focus | Shows visible focus ring |

### Visual States

| State | Appearance |
|-------|-----------|
| Default | Large circular button, mic icon centered |
| Hover | Slight scale increase (1.05x) |
| Focus | Visible focus ring (blue, 2px) |
| Active (pressed) | Scale decrease (0.95x) |
| Recording | Pulse animation (scale 1.0 → 1.1 → 1.0, opacity 1 → 0.8 → 1) |
| Disabled | Opacity 0.5, not clickable |

### Recording Animation

```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.recording {
  animation: pulse 1.5s ease-in-out infinite;
  will-change: transform, opacity;
}
```

---

## Accessibility

### ARIA Attributes

```tsx
<button
  aria-label={isRecording ? "Stop recording" : "Start voice recording"}
  aria-pressed={isRecording}
  disabled={disabled}
  onClick={isRecording ? onStop : onStart}
>
  <MicIcon />
</button>
```

### Keyboard Navigation

- **Tab**: Focus button
- **Enter/Space**: Activate button
- **Escape**: Stop recording (if recording)

### Screen Reader Support

- `aria-label`: "Start voice recording" / "Stop recording"
- `aria-pressed`: Indicates toggle state
- State changes announced immediately

---

## Dependencies

- **Icons**: `lucide-react` - `MicIcon`, `Square` (stop icon)
- **Styling**: Tailwind CSS classes

---

## Example Usage

```tsx
import { MicrophoneButton } from '@/components/MicrophoneButton'
import { useNoteStore } from '@/store/useNoteStore'

export function VoiceDictationApp() {
  const { recording, startRecording, stopRecording } = useNoteStore()

  return (
    <div className="flex items-center justify-center">
      <MicrophoneButton
        isRecording={recording.isRecording}
        onStart={startRecording}
        onStop={stopRecording}
      />
    </div>
  )
}
```

---

## Constraints

- **Size**: Minimum 80px × 80px touch target (WCAG AA)
- **Color Contrast**: Minimum 4.5:1 for icon/text
- **Animation**: 60 FPS target (GPU-accelerated)
- **Single Session**: Only one active recording at a time

---

## Testing

### Unit Tests

```typescript
describe('MicrophoneButton', () => {
  it('calls onStart when clicked while not recording')
  it('calls onStop when clicked while recording')
  it('shows pulse animation when isRecording is true')
  it('is disabled when disabled prop is true')
  it('has correct aria-label based on recording state')
  it('activates on Enter key press')
})
```

### Accessibility Tests

- Verify keyboard navigation works
- Verify screen reader announces state changes
- Verify focus ring visible
- Verify color contrast meets WCAG AA

---

## Future Enhancements

- Visual waveform visualization during recording
- Recording timer display
- Sound effect on start/stop (optional)

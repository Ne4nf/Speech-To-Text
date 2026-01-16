# Component Contract: BrowserSupportAlert

**Feature**: 001-voice-dictation
**Component**: `BrowserSupportAlert`
**Status**: Draft

---

## Purpose

Warning banner displayed when Web Speech API is not supported in the current browser. Guides users to supported browsers (Chrome or Edge).

---

## Props Interface

```typescript
interface BrowserSupportAlertProps {
  isVisible: boolean
  onClose?: () => void
  ariaLabel?: string
}
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isVisible` | `boolean` | Yes | - | Show/hide alert |
| `onClose` | `() => void` | No | - | Callback when close clicked (optional) |
| `ariaLabel` | `string` | No | `"Browser not supported warning"` | Accessibility label |

---

## Behavior

### User Interactions

| Action | Behavior |
|--------|----------|
| Close button | Calls `onClose()`, hides alert |
| No interaction | Alert remains visible (if no close handler) |

### Visual States

| State | Appearance |
|-------|-----------|
| Visible | Prominent warning banner at top of page |
| Hidden | Removed from DOM (not `display: none`) |

---

## Accessibility

### ARIA Attributes

```tsx
<div
  role="alert"
  aria-live="assertive"
  aria-label={ariaLabel}
>
  <p>
    Browser not supported. Please use <a href="https://www.google.com/chrome/">Chrome</a> or <a href="https://www.microsoft.com/edge">Edge</a> for speech recognition.
  </p>
  <button
    aria-label="Close warning"
    onClick={onClose}
  >
    <XIcon />
  </button>
</div>
```

### Live Region

- **`role="alert"`**: Indicates important, time-sensitive message
- **`aria-live="assertive"`**: Announces immediately, interrupts current speech
- Screen readers announce message immediately on render

---

## Dependencies

- **Icons**: `lucide-react` - `XIcon` (close icon)
- **Styling**: Tailwind CSS classes

---

## Example Usage

```tsx
import { BrowserSupportAlert } from '@/components/BrowserSupportAlert'
import { useEffect, useState } from 'react'

export function VoiceDictationApp() {
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    // Check Web Speech API support
    const supported =
      'SpeechRecognition' in window ||
      'webkitSpeechRecognition' in window
    setIsSupported(supported)
  }, [])

  return (
    <>
      {!isSupported && (
        <BrowserSupportAlert
          isVisible={!isSupported}
          ariaLabel="Browser not supported warning"
        />
      )}
      {/* Rest of app hidden if not supported */}
    </>
  )
}
```

---

## Browser Detection

```typescript
function isSpeechRecognitionSupported(): boolean {
  return (
    'SpeechRecognition' in window ||
    'webkitSpeechRecognition' in window
  )
}
```

---

## Constraints

- **Placement**: Top of page, below browser chrome
- **Width**: Full width (responsive)
- **Minimum Height**: 60px (sufficient for text + close button)
- **Color Contrast**: Warning yellow/orange background, dark text (WCAG AA)

---

## Styling

### Tailwind Classes

```tsx
<div
  role="alert"
  aria-live="assertive"
  className="w-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 flex items-center justify-between"
>
  <div className="flex items-center">
    <AlertTriangleIcon className="w-6 h-6 mr-3 flex-shrink-0" />
    <p>
      Browser not supported. Please use{' '}
      <a
        href="https://www.google.com/chrome/"
        className="underline font-semibold hover:text-yellow-800"
      >
        Chrome
      </a>{' '}
      or{' '}
      <a
        href="https://www.microsoft.com/edge"
        className="underline font-semibold hover:text-yellow-800"
      >
        Edge
      </a>{' '}
      for speech recognition.
    </p>
  </div>
  {onClose && (
    <button
      aria-label="Close warning"
      onClick={onClose}
      className="ml-4 p-1 hover:bg-yellow-200 rounded"
    >
      <XIcon className="w-5 h-5" />
    </button>
  )}
</div>
```

---

## Color Contrast

- **Background**: Yellow-100 (`#FEF3C7`, Tailwind)
- **Text**: Yellow-900 (`#78350F`, Tailwind)
- **Border**: Yellow-500 (`#EAB308`, Tailwind)
- **Links**: Underlined, hover yellow-800
- **Contrast Ratio**: ~7:1 (exceeds WCAG AA 4.5:1)

---

## Testing

### Unit Tests

```typescript
describe('BrowserSupportAlert', () => {
  it('renders when isVisible is true')
  it('does not render when isVisible is false')
  it('calls onClose when close button clicked')
  it('has correct ARIA attributes')
  it('has accessible links to Chrome and Edge')
})
```

### Accessibility Tests

- Verify screen reader announces alert immediately
- Verify links are accessible via keyboard
- Verify close button has accessible label
- Verify color contrast meets WCAG AA

---

## Edge Cases

- **LocalStorage disabled**: Show combined warning message
- **Both alerts**: Stack warnings vertically (browser + localStorage)
- **Mobile browsers**: Same message, ensure links open app store

---

## Future Enhancements

- Download buttons for Chrome/Edge (instead of links)
- Browser version detection (e.g., "Chrome 79+ required")
- QR code for mobile browsers to download on desktop
- "Try anyway" button (for experimental browsers)

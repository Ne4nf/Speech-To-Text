# Component Contract: LanguageSelector

**Feature**: 001-voice-dictation
**Component**: `LanguageSelector`
**Status**: Draft

---

## Purpose

Dropdown selector for choosing speech recognition language (English or Vietnamese). Changes language for next recording session.

---

## Props Interface

```typescript
interface LanguageSelectorProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
  disabled?: boolean
  ariaLabel?: string
}

type Language = 'en-US' | 'vi-VN'
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentLanguage` | `Language` | Yes | - | Currently selected language |
| `onLanguageChange` | `(language: Language) => void` | Yes | - | Callback when language changes |
| `disabled` | `boolean` | No | `false` | Disable selector (e.g., while recording) |
| `ariaLabel` | `string` | No | `"Select language"` | Accessibility label |

---

## Behavior

### User Interactions

| Action | Behavior |
|--------|----------|
| Click dropdown | Opens language options |
| Select option | Calls `onLanguageChange(language)` |
| Keyboard nav | Arrow keys to navigate, Enter to select |

### Visual States

| State | Appearance |
|-------|-----------|
| Default | Dropdown with current language name |
| Expanded | List of available languages |
| Disabled | Grayed out, not clickable |
| Focus | Blue border, visible focus ring |

### Language Options

```typescript
const LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'vi-VN', name: 'Tiếng Việt' }
]
```

---

## Accessibility

### ARIA Attributes

```tsx
<div role=" combobox" aria-expanded={isOpen} aria-haspopup="listbox">
  <button
    aria-label={ariaLabel}
    aria-activedescendant={focusedOptionId}
    onClick={toggleDropdown}
  >
    {currentLanguageName}
    <ChevronDownIcon />
  </button>

  {isOpen && (
    <ul role="listbox">
      {languages.map((lang) => (
        <li
          key={lang.code}
          role="option"
          aria-selected={lang.code === currentLanguage}
          onClick={() => onLanguageChange(lang.code)}
        >
          {lang.name}
        </li>
      ))}
    </ul>
  )}
</div>
```

### Keyboard Navigation

- **Enter/Space**: Open/close dropdown
- **Arrow Down/Up**: Navigate options
- **Enter**: Select focused option
- **Escape**: Close dropdown
- **Tab**: Focus next element

---

## Dependencies

- **Icons**: `lucide-react` - `ChevronDownIcon`
- **Styling**: Tailwind CSS classes

---

## Example Usage

```tsx
import { LanguageSelector } from '@/components/LanguageSelector'
import { useNoteStore } from '@/store/useNoteStore'

export function VoiceDictationApp() {
  const { language, setLanguage } = useNoteStore()

  return (
    <LanguageSelector
      currentLanguage={language}
      onLanguageChange={setLanguage}
      ariaLabel="Select language for speech recognition"
    />
  )
}
```

---

## Constraints

- **Minimum Width**: 200px (accommodate "Tiếng Việt" text)
- **Minimum Touch Target**: 44px × 44px (WCAG AA)
- **Options**: Fixed to 2 languages for MVP

---

## Styling

### Tailwind Classes

```tsx
<div className="relative">
  <button
    className="flex items-center justify-between w-64 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    aria-label={ariaLabel}
    onClick={toggle}
  >
    <span>{currentLanguageName}</span>
    <ChevronDownIcon className="w-5 h-5 ml-2" />
  </button>

  {isOpen && (
    <ul
      role="listbox"
      className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
    >
      {languages.map((lang) => (
        <li
          key={lang.code}
          role="option"
          aria-selected={lang.code === currentLanguage}
          onClick={() => {
            onLanguageChange(lang.code)
            setIsOpen(false)
          }}
          className={`px-4 py-2 cursor-pointer ${
            lang.code === currentLanguage
              ? 'bg-blue-50 text-blue-700'
              : 'hover:bg-gray-100'
          }`}
        >
          {lang.name}
        </li>
      ))}
    </ul>
  )}
</div>
```

---

## Testing

### Unit Tests

```typescript
describe('LanguageSelector', () => {
  it('displays current language name')
  it('opens dropdown when clicked')
  it('calls onLanguageChange when option selected')
  it('closes dropdown after selection')
  it('is disabled when disabled prop is true')
  it('has correct ARIA attributes')
})
```

### Accessibility Tests

- Verify screen reader announces current language
- Verify keyboard navigation works
- Verify options announced with "selected" state
- Verify focus ring visible

---

## Future Enhancements

- Additional languages (Spanish, French, Chinese, etc.)
- Language detection from text
- Custom language codes
- Language flags/icons

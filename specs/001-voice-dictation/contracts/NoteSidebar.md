# Component Contract: NoteSidebar

**Feature**: 001-voice-dictation
**Component**: `NoteSidebar`
**Status**: Draft

---

## Purpose

Sidebar displaying list of saved notes with delete functionality. Shows notes in reverse chronological order (most recent first).

---

## Props Interface

```typescript
interface NoteSidebarProps {
  notes: Note[]
  onDeleteNote: (id: string) => void
  onSelectNote?: (note: Note) => void
  ariaLabel?: string
}
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `notes` | `Note[]` | Yes | - | Array of saved notes |
| `onDeleteNote` | `(id: string) => void` | Yes | - | Callback when delete button clicked |
| `onSelectNote` | `(note: Note) => void` | No | - | Callback when note selected (future enhancement) |
| `ariaLabel` | `string` | No | `"Saved notes"` | Accessibility label |

---

## Behavior

### User Interactions

| Action | Behavior |
|--------|----------|
| Click note | No action in MVP (future: load note into textarea) |
| Click delete button | Calls `onDeleteNote(id)`, removes note from list |
| Hover note | Highlight background |

### Visual States

| State | Appearance |
|-------|-----------|
| Default | List of notes, each with title + timestamp |
| Hover | Light gray background |
| Empty | Placeholder: "No saved notes yet" |

### Note Item Display

```tsx
<div className="note-item">
  <div className="note-title">{note.title}</div>
  <div className="note-date">{formatDate(note.createdAt)}</div>
  <button
    aria-label={`Delete note: ${note.title}`}
    onClick={() => onDeleteNote(note.id)}
  >
    <TrashIcon />
  </button>
</div>
```

---

## Accessibility

### ARIA Attributes

```tsx
<ul role="list" aria-label={ariaLabel}>
  {notes.map((note) => (
    <li key={note.id}>
      <button
        aria-label={`Delete note: ${note.title}`}
        onClick={() => onDeleteNote(note.id)}
      >
        <TrashIcon />
      </button>
    </li>
  ))}
</ul>
```

### Empty State

```tsx
{notes.length === 0 && (
  <div role="status" aria-live="polite">
    No saved notes yet
  </div>
)}
```

### Keyboard Navigation

- **Tab**: Navigate through notes
- **Enter**: Select note (future enhancement)
- **Delete/Backspace**: Delete focused note (optional enhancement)

---

## Dependencies

- **Icons**: `lucide-react` - `TrashIcon`
- **Date Formatting**: Native `Intl.DateTimeFormat` or simple utility
- **Styling**: Tailwind CSS classes

---

## Example Usage

```tsx
import { NoteSidebar } from '@/components/NoteSidebar'
import { useNoteStore } from '@/store/useNoteStore'

export function VoiceDictationApp() {
  const { notes, deleteNote } = useNoteStore()

  return (
    <NoteSidebar
      notes={notes}
      onDeleteNote={deleteNote}
      ariaLabel="Saved notes"
    />
  )
}
```

---

## Constraints

- **Width**: Fixed 300px sidebar (desktop), full width (mobile)
- **Max Height**: 100vh with scroll overflow
- **Minimum Touch Target**: 44px × 44px for delete button (WCAG AA)
- **Sort Order**: Descending by `createdAt` (most recent first)

---

## Styling

### Tailwind Classes

```tsx
<aside className="w-80 h-full border-l border-gray-200 bg-white overflow-y-auto">
  <h2 className="text-lg font-semibold p-4">Saved Notes</h2>

  {notes.length === 0 ? (
    <div className="p-4 text-gray-500 text-center">
      No saved notes yet
    </div>
  ) : (
    <ul role="list" className="divide-y divide-gray-200">
      {notes.map((note) => (
        <li
          key={note.id}
          className="p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-medium text-gray-900 truncate">
                {note.title}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {new Date(note.createdAt).toLocaleString()}
              </div>
            </div>
            <button
              aria-label={`Delete note: ${note.title}`}
              onClick={() => onDeleteNote(note.id)}
              className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )}
</aside>
```

---

## Date Formatting

```typescript
function formatNoteDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  if (diffMins < 43200) return `${Math.floor(diffMins / 1440)}d ago`

  return date.toLocaleDateString()
}
```

---

## Testing

### Unit Tests

```typescript
describe('NoteSidebar', () => {
  it('displays list of notes')
  it('shows empty state when no notes')
  it('calls onDeleteNote when delete button clicked')
  it('sorts notes by createdAt descending')
  it('has correct ARIA labels')
})
```

### Accessibility Tests

- Verify screen reader announces note list
- Verify delete buttons have accessible labels
- Verify keyboard navigation through notes
- Verify empty state announced

---

## Future Enhancements

- Click note to load into textarea
- Search/filter notes
- Note categories/tags
- Pin important notes
- Export all notes

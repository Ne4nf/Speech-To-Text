# Research: Voice Dictation Interface (MVP)

**Feature**: 001-voice-dictation
**Date**: 2026-01-16
**Phase**: Phase 0 - Research & Technical Decisions

## Table of Contents

1. [Web Speech API Browser Support](#1-web-speech-api-browser-support)
2. [React Speech Recognition Libraries](#2-react-speech-recognition-libraries)
3. [LocalStorage Limits and Fallbacks](#3-localstorage-limits-and-fallbacks)
4. [Pulse Animation Performance](#4-pulse-animation-performance)
5. [Zustand Best Practices](#5-zustand-best-practices)
6. [Accessibility Patterns](#6-accessibility-patterns)
7. [Language Switching](#7-language-switching)

---

## 1. Web Speech API Browser Support

### Prior Work
No previous speech recognition features found in codebase.

### Decision
Use native **Web Speech API** directly without additional abstraction layers.

### Rationale
- **Browser Support**: Chrome 25+ and Edge 79+ have robust Web Speech API support
- **Vietnamese Language**: Use language code `vi-VN` for Vietnamese speech recognition
- **No Backend Required**: All processing happens client-side
- **Constitution Alignment**: Follows "Browser-Native First" principle
- **Simplicity**: Direct API usage avoids unnecessary dependencies (per "Simplicity & YAGNI" principle)

### Implementation Details
- **Primary Browsers**: Chrome and Edge (per project assumptions)
- **Language Codes**:
  - English: `en-US`
  - Vietnamese: `vi-VN`
- **API Capabilities**:
  - Continuous speech recognition
  - Real-time transcription
  - Interim results (transcript updates while speaking)
  - Language switching support
- **Error Handling**: Handle permission denial and unsupported browsers

### Alternatives Considered
- **SpeechRecognition Polyfills**: Rejected as unnecessary for Chrome/Edge target
- **Cloud Speech Services**: Rejected due to privacy ("Privacy by Design") and cost concerns

### Resources
- [MDN Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Using the Web Speech API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- [Chrome Blog - Voice Driven Web Apps](https://developer.chrome.com/blog/voice-driven-web-apps-introduction-to-the-web-speech-api)
- [Web Speech API Demonstration - Chrome](https://www.google.com/intl/en/chrome/demos/speech.html)
- [Stack Overflow - Chrome Language Codes](https://stackoverflow.com/questions/14257598/what-are-language-codes-in-chromes-implementation-of-the-html5-speech-recogniti)
- [caniuse.com - Web Speech API](https://caniuse.com/?search=web%20speech%20api)

---

## 2. React Speech Recognition Libraries

### Prior Work
No existing speech recognition hooks or libraries found in codebase.

### Decision
Use **direct Web Speech API** with custom React state management instead of `react-speech-recognition` library.

### Rationale
- **Constitution Alignment**: "Simplicity & YAGNI" principle - avoid unnecessary dependencies
- **Control**: Direct API access provides full control over recognition behavior
- **Learning**: Better understanding of browser APIs for team
- **Bundle Size**: Smaller bundle without additional library
- **Maintenance**: Fewer dependencies to update and maintain

### When to Reconsider
If speech recognition is reused in 3+ components or complexity grows significantly, then create a custom hook (`useSpeechRecognition.ts`) per constitution guidance: "no custom hooks unless reused 3+ times."

### Alternatives Considered
- **react-speech-recognition**: Provides React hook wrapper and state management
  - **Pros**: Less boilerplate, React-idiomatic API
  - **Cons**: Additional dependency, less control, not needed for simple use case
- **@mazka/react-speech-to-text**: TypeScript-first alternative
  - **Pros**: Better TypeScript support
  - **Cons**: Still an unnecessary dependency for our simple use case

### Resources
- [React Speech to Text - How We Solved It](https://medium.com/@k.lovcio/react-speech-to-text-how-we-solved-speech-transcription-in-the-tolgy-application-8515d2adc0bd)
- [Implementing React Speech Recognition in Your Apps](https://reverieinc.com/blog/implementing-react-speech-recognition-in-your-apps/)
- [JamesBrill/react-speech-recognition GitHub](https://github.com/JamesBrill/react-speech-recognition)
- [mazka/react-speech-to-text on npm](https://www.npmjs.com/package/@mazka/react-speech-to-text)
- [Reddit - Web Speech API Discussion](https://www.reddit.com/r/Frontend/comments/1poqw3r/til_the_web_speech_api_exists_and-its-way-more)

---

## 3. LocalStorage Limits and Fallbacks

### Prior Work
No existing LocalStorage usage found in codebase.

### Decision
Use **LocalStorage with in-memory fallback** and proper error handling.

### Rationale
- **Quota Limits**: 5-10MB per origin (browser-dependent), sufficient for MVP
- **Constitution Alignment**: "Browser-Native First" - use built-in storage
- **Simplicity**: LocalStorage simpler than IndexedDB for text notes
- **Offline Capability**: Meets "Privacy by Design" requirement

### Implementation Strategy
1. **Primary Storage**: LocalStorage with key `speech-to-text-notes`
2. **Fallback**: In-memory storage (JavaScript array) if LocalStorage disabled
3. **Error Handling**:
   - Wrap `setItem`/`getItem` in try-catch
   - Detect `QuotaExceededError`
   - Show user-friendly message when quota full
4. **Data Structure**: JSON array of note objects
5. **Compression**: Not needed for MVP (text-only, hundreds of notes fit in 5MB)

### Migration Path
If notes grow beyond 5MB (unlikely for MVP), migrate to IndexedDB:
- Gradual migration pattern
- Keep LocalStorage as fallback during transition
- Cleanup old data after migration

### Alternatives Considered
- **IndexedDB**: Rejected for MVP due to complexity
  - **Pros**: Larger storage (50MB+), better for large data
  - **Cons**: More complex API, overkill for text notes
- **SessionStorage**: Rejected - doesn't persist across sessions
- **Cookies**: Rejected - 4KB limit too small, sent with HTTP requests

### Resources
- [7 Reasons You Must Stop Using LocalStorage in 2025](https://medium.com/@saneekadam1326/7-reasons-you-must-stop-using-localstorage-in-2025-and-what-to-use-instead-d06ea41ab1f8)
- [How to Fix `Failed to execute 'setItem' on 'Storage'`](https://trackjs.com/javascript-errors/failed-to-execute-setitem-on-storage/)
- [MDN - Storage Quotas and Eviction Criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [3 Hidden Dangers of LocalStorage in 2025](https://medium.com/@diyasanjaysatpute147/3-hidden-dangers-of-localstorage-in-2025-that-no-one-warned-you-about-54790f33e86b)
- [LocalStorage vs IndexedDB: Choosing the Right Solution](https://shiftasia.com/community/localstorage-vs-indexeddb-choosing-the-right-solution-for-your-web-application)
- [What is Web Storage: Types, Tips & Use Cases](https://www.ramotion.com/blog/what-is-web-storage)

---

## 4. Pulse Animation Performance

### Prior Work
No existing animations found in codebase.

### Decision
Use **CSS transform-based pulse animation** with GPU acceleration.

### Rationale
- **Performance**: GPU-accelerated properties (`transform`, `opacity`) avoid layout thrashing
- **Simplicity**: Pure CSS, no JavaScript required
- **Browser Support**: Widely supported in modern browsers
- **Constitution Alignment**: "Simplicity & YAGNI" - avoid animation libraries

### Implementation Details
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

.microphone-button.recording {
  animation: pulse 1.5s ease-in-out infinite;
  will-change: transform, opacity;
}
```

### Performance Best Practices
1. **Use Transform Properties**: `transform: scale()` instead of width/height
2. **Leverage `will-change`**: Hints browser to optimize GPU layers
3. **Avoid Layout-Triggering Properties**: No `top`, `left`, `width`, `height`
4. **Target 60 FPS**: Smooth animation using hardware acceleration
5. **Minimal Paints**: Use properties that don't trigger repaints

### Alternatives Considered
- **Framer Motion**: Rejected - unnecessary dependency for simple pulse
- **CSS `@keyframes` vs JavaScript**: Chose CSS for performance and simplicity
- **SVG Animation**: Rejected - overkill for simple pulse effect

### Resources
- [Marko Denic - CSS Pulse Animation](https://markodenic.tech/css-pulse-animation/)
- [web.dev - High-Performance Animations Guide](https://web.dev/articles/animations-guide)
- [MDN - CSS & JavaScript Animation Performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance)
- [CSS Animation Techniques for 2025](https://medium.com/@orami98/css-animation-techniques-that-will-transform-your-website-in-2025-95a499de9380)
- [CSS Optimization Guide 2025](https://dev.to/satyam_gupta_0d1ff2152dcc/css-optimization-guide-2025-speed-up-your-website-best-practices-code-examples-31ib)

---

## 5. Zustand Best Practices

### Prior Work
No existing state management found in codebase.

### Decision
Use **Zustand with persist middleware** for LocalStorage synchronization.

### Rationale
- **Simplicity**: Minimal boilerplate compared to Redux
- **Performance**: No Context Provider overhead
- **TypeScript**: Excellent TypeScript support
- **Bundle Size**: Small (~1KB)
- **Constitution Alignment**: "Simplicity & YAGNI" - choose simplest viable solution

### Implementation Pattern
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NoteStore {
  notes: Note[]
  addNote: (note: Note) => void
  deleteNote: (id: string) => void
}

const useNoteStore = create(
  persist<NoteStore>(
    (set) => ({
      notes: [],
      addNote: (note) => set((state) => ({
        notes: [note, ...state.notes]
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(n => n.id !== id)
      }))
    }),
    {
      name: 'speech-to-text-storage',
      partialize: (state) => ({ notes: state.notes }), // Selective persistence
    }
  )
)
```

### Best Practices
1. **Selective Persistence**: Only persist notes, exclude temporary UI state
2. **Partialize**: Use `partialize` to choose what to persist
3. **Storage Name**: Use descriptive storage name for debugging
4. **TypeScript**: Type the store interface properly
5. **DevTools**: Integrate Redux DevTools for debugging

### Alternatives Considered
- **React Context**: Rejected - re-renders entire subtree on state change
- **Redux**: Rejected - overkill for simple note storage
- **Jotai**: Rejected - Zustand chosen for simplicity
- **TanStack Query**: Not needed - no server state management

### Resources
- [Zustand Official - Persisting Store Data](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)
- [Do You Need State Management in 2025?](https://dev.to/saswatapal/do-you-need-state-management-in-2025-react-context-vs-zustand-vs-jotai-vs-redux-1ho)
- [Persistence Strategy with LocalStorage](https://zread.ai/InitialXKO/Writing/9-persistence-strategy-with-localstorage)
- [Can We Use Local Storage Instead of Context/Redux?](https://www.developerway.com/posts/local-storage-instead-of-context)
- [Zustand and TanStack Query: The Dynamic Duo](https://javascript.plainenglish.io/zustand-and-tanstack-query-the-dynamic-duo-that-simplified-my-react-state-management-e71b924efb90)
- [How to Persist App State with Zustand's Persist Middleware](https://www.linkedin.com/posts/rohit-chaware_ever-wished-your-app-state-couldmagically-activity-7372486694312247296-wlri)

---

## 6. Accessibility Patterns

### Prior Work
No existing accessibility implementation found in codebase.

### Decision
Implement **WCAG 2.1 AA compliance** with ARIA labels and keyboard navigation.

### Rationale
- **Constitution Alignment**: "Accessibility First" principle requires
- **Legal**: Avoid ADA compliance issues
- **User Base**: Speech-to-text app should be usable by everyone
- **Screen Reader Support**: Essential for accessible interface

### Implementation Checklist

#### ARIA Labels
```tsx
<button
  aria-label="Start voice recording"
  aria-pressed={isRecording}
  onClick={startRecording}
>
  <MicIcon />
</button>
```

#### Keyboard Navigation
- **Tab Order**: Logical tab flow through controls (Mic → Stop → Save → Clear → Sidebar)
- **Enter/Space**: Activate buttons with Enter or Space key
- **Escape**: Stop recording when Escape pressed
- **Shortcuts**: Consider shortcuts (e.g., Ctrl+R to record, Ctrl+S to save)

#### Visual Feedback
- **Recording State**: Clear visual indicator (pulse animation)
- **Focus States**: Visible focus rings on all interactive elements
- **Error Messages**: `aria-live` regions for dynamic error messages
- **Status Updates**: `aria-live="polite"` for transcript updates

#### Screen Reader Support
```tsx
<div
  role="status"
  aria-live="polite"
  aria-label="Transcript"
>
  {transcript}
</div>
```

### Color Contrast
- **Normal Text**: Minimum 4.5:1 contrast ratio (WCAG AA)
- **Large Text**: Minimum 3:1 contrast ratio
- **Interactive Elements**: Visual focus indicator

### Alternatives Considered
- **Skip Navigation**: Not needed for simple single-page app
- **High Contrast Mode**: Nice-to-have for future enhancement

### Resources
- [ARIA Labels for Web Accessibility: Complete 2025 Guide](https://www.allaccessible.org/blog/implementing-aria-labels-for-web-accessibility)
- [aria-label in HTML: The Secret to Accessible Buttons & Forms](https://eye-able.com/blog/aria-label)
- [MDN - ARIA Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [Authoring Practices Guide (APG) 2025](https://elementor.com/blog/apg-explained/)
- [ARIA Labels Guide for WCAG Compliance](https://testparty.ai/blog/aria-labels-guide)
- [Annotating Design System Components for Accessibility](https://zeroheight.com/blog/how-to-annotate-design-system-components-for-accessibility/)

---

## 7. Language Switching

### Prior Work
No existing language switching implementation found in codebase.

### Decision
Implement **session-scoped language preference** stored in browser session.

### Rationale
- **User Experience**: Language preference persists during browser session
- **Privacy**: Reset on browser close (per "Privacy by Design")
- **Simplicity**: No LocalStorage needed for preference
- **Assumption Alignment**: Matches spec assumption #7

### Implementation Strategy
1. **State Management**: Zustand store for language state (non-persisted)
2. **Web Speech API**: Update `SpeechRecognition.lang` property when language changes
3. **UI**: Dropdown with English and Vietnamese options
4. **Behavior**:
   - Language change affects next recording session
   - Active recording not interrupted
   - Session-scoped (resets on browser close)

### Code Example
```typescript
// In speech.ts
const recognition = new SpeechRecognition()
recognition.lang = language // 'en-US' or 'vi-VN'

// When language changes
recognition.stop()
recognition.lang = newLanguage
// Resume if was recording
if (wasRecording) recognition.start()
```

### Edge Cases
- **Active Recording**: Stop and restart recognition with new language
- **In-Flight Results**: Clear interim results on language switch
- **Unsupported Language**: Show error if selected language not supported

### Alternatives Considered
- **LocalStorage Persistence**: Rejected - privacy concern, session-scoped sufficient
- **URL Parameter**: Rejected - unnecessary complexity for single-user app
- **Browser Language Detection**: Rejected - user should explicitly choose

### Resources
- (No specific external resources needed - standard Web Speech API behavior)

---

## Summary of Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Speech API** | Native Web Speech API | Browser-native, no backend, simple |
| **State Management** | Zustand with persist | Minimal boilerplate, LocalStorage sync |
| **Storage** | LocalStorage (5-10MB) | Sufficient for MVP, offline-capable |
| **Animation** | CSS transform-based | GPU-accelerated, performant |
| **Accessibility** | WCAG 2.1 AA | Legal compliance, inclusive design |
| **Language Preference** | Session-scoped | Privacy, simplicity, matches assumptions |
| **React Hook** | Custom (if reused 3+ times) | Per constitution YAGNI principle |

All decisions align with constitutional principles:
- ✅ **Browser-Native First**: Web Speech API, LocalStorage
- ✅ **Privacy by Design**: No backend, no telemetry, local-only data
- ✅ **Simplicity & YAGNI**: Minimal dependencies, direct API usage
- ✅ **Accessibility First**: WCAG AA compliance, keyboard navigation

---

## Next Steps

1. ✅ Phase 0 Research Complete
2. ⏳ **Phase 1**: Generate data-model.md
3. ⏳ **Phase 1**: Generate component contracts
4. ⏳ **Phase 1**: Generate quickstart.md
5. ⏳ **Phase 1**: Update agent context
6. ⏳ **Phase 2**: Run `/specledger.tasks` for task breakdown

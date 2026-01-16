# Quickstart Guide: Voice Dictation Interface (MVP)

**Feature**: 001-voice-dictation
**Last Updated**: 2026-01-15

---

## Overview

This guide will help you set up and run the Voice Dictation Interface MVP locally. The application is a browser-based voice-to-text tool that uses the Web Speech API for real-time speech recognition.

---

## Prerequisites

### Required Software

- **Node.js**: v20+ (LTS recommended)
- **npm**: v10+ (comes with Node.js)
- **Browser**: Chrome 25+ or Edge 79+ (for Web Speech API support)

### Verify Installation

```bash
node --version  # Should be v20+
npm --version   # Should be v10+
```

---

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
# Navigate to project root
cd Speech-To-Text

# Install dependencies
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Grant Microphone Permission

When you first click the microphone button:
1. Browser will request microphone permission
2. Click "Allow"
3. Start speaking!

---

## Project Structure

```
Speech-To-Text/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main voice dictation page
│   └── globals.css          # Tailwind styles
├── components/              # React components
│   ├── MicrophoneButton.tsx # Mic button with pulse animation
│   ├── TextArea.tsx         # Real-time transcript display
│   ├── NoteSidebar.tsx      # Saved notes list
│   ├── LanguageSelector.tsx # Language dropdown (EN/VI)
│   └── BrowserSupportAlert.tsx # Unsupported browser warning
├── lib/                     # Utility libraries
│   ├── speech.ts            # Web Speech API wrapper
│   ├── storage.ts           # LocalStorage wrapper
│   └── types.ts             # TypeScript types
├── store/                   # Zustand state management
│   └── useNoteStore.ts      # Notes + recording state
└── tests/                   # Test files
    ├── unit/                # Vitest unit tests
    ├── integration/         # React Testing Library
    └── e2e/                 # Playwright E2E tests
```

---

## Core User Flows

### 1. Voice Recording (P1 - MVP)

```
1. Click microphone button
2. Grant microphone permission (first time only)
3. Speak into microphone
4. See text appear in real-time
5. Click "Stop" to finalize
```

**Expected Result**: Transcript appears in textarea as you speak

### 2. Save Note (P1 - MVP)

```
1. Record speech (or type in textarea)
2. Click "Save Note" button
3. Note appears in sidebar
4. Note persists after page refresh
```

**Expected Result**: Note saved to LocalStorage, visible in sidebar

### 3. Delete Note (P2 - Enhancement)

```
1. Locate note in sidebar
2. Click trash icon next to note
3. Note removed from sidebar
4. Note deleted from LocalStorage
```

**Expected Result**: Note permanently deleted

### 4. Switch Language (P2 - Enhancement)

```
1. Click language dropdown
2. Select "Tiếng Việt" (Vietnamese)
3. Click microphone button
4. Speak in Vietnamese
5. See Vietnamese text appear
```

**Expected Result**: Speech recognition uses Vietnamese language model

---

## Key Commands

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint

# Format code
npm run format
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests
npm run test:e2e

# Watch mode (development)
npm run test:watch
```

---

## Browser Compatibility

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 25+ | ✅ Supported | Primary target |
| Edge | 79+ | ✅ Supported | Chromium-based |
| Safari | 14.1+ | ⚠️ Partial | Web Speech API experimental |
| Firefox | - | ❌ Not Supported | No Web Speech API |

**Recommendation**: Use Chrome or Edge for full functionality.

---

## Configuration

### Environment Variables

Create `.env.local` in project root:

```bash
# Optional: Enable debug mode
NEXT_PUBLIC_DEBUG=true

# Optional: Custom LocalStorage key
NEXT_PUBLIC_STORAGE_KEY=speech-to-text-notes
```

### Tailwind CSS Configuration

`tailwind.config.js`:

```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        pulse: 'pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
      },
    },
  },
}
```

---

## Troubleshooting

### "Browser not supported" Error

**Cause**: Web Speech API not available in current browser

**Solution**: Use Chrome 25+ or Edge 79+

---

### "Microphone permission denied" Error

**Cause**: User denied microphone access

**Solution**:
1. Click lock icon in browser address bar
2. Find "Microphone" permission
3. Set to "Allow"
4. Refresh page

---

### LocalStorage Full Error

**Cause**: 5-10MB LocalStorage quota exceeded

**Solution**:
1. Delete old notes from sidebar
2. Or clear browser data for this site
3. Contact developer if issue persists

---

### Speech Recognition Not Working

**Possible Causes**:
1. Microphone not connected
2. Another app using microphone
3. Browser permission denied
4. Network connectivity (some browsers require)

**Solutions**:
1. Check microphone is connected and working
2. Close other apps using microphone
3. Grant microphone permission
4. Check internet connection (Chrome requires)

---

## Development Tips

### 1. Hot Reload

Next.js provides hot reload by default. Changes to components will reflect immediately without full page refresh.

### 2. Debug Speech Recognition

```typescript
// In lib/speech.ts
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === 'true'

if (DEBUG) {
  console.log('Speech recognition started')
  console.log('Language:', recognition.lang)
}
```

### 3. Inspect LocalStorage

```javascript
// In browser console
localStorage.getItem('speech-to-text-storage')
// Returns: {"notes":[...],"version":1}
```

### 4. Clear All Data

```javascript
// In browser console
localStorage.removeItem('speech-to-text-storage')
location.reload()
```

---

## Performance Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Page Load | <5s | DevTools Network tab |
| Speech Display | <500ms | Stopwatch from speech to text |
| State Updates | <50ms | React DevTools Profiler |
| Bundle Size | <250KB gzipped | `npm run build` output |

---

## Accessibility Checklist

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces all state changes
- [ ] Focus rings visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] ARIA labels present on all buttons
- [ ] `aria-live` regions for dynamic content
- [ ] Pulse animation can be disabled (respects `prefers-reduced-motion`)

---

## Next Steps

### For Developers

1. **Explore the Code**:
   - Start with `app/page.tsx` (main page)
   - Review `store/useNoteStore.ts` (state management)
   - Check `lib/speech.ts` (Web Speech API wrapper)

2. **Run Tests**:
   ```bash
   npm test
   ```

3. **Make Changes**:
   - Edit components in `components/`
   - See changes hot-reload in browser

4. **Learn More**:
   - Read [research.md](./research.md) for technical decisions
   - Read [data-model.md](./data-model.md) for data structures
   - Read [contracts/](./contracts/) for component APIs

### For Users

1. **Try the Demo**:
   - Go to `http://localhost:3000`
   - Click microphone button
   - Start speaking!

2. **Save Notes**:
   - Record something
   - Click "Save Note"
   - Refresh page - note persists!

3. **Switch Languages**:
   - Try Vietnamese language
   - Compare recognition accuracy

---

## Support

### Documentation

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Research Findings](./research.md)
- [Data Model](./data-model.md)
- [Component Contracts](./contracts/)

### Issues

If you encounter bugs or have feature requests:

1. Check existing GitHub issues
2. Create new issue with:
   - Browser name and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)

---

## License

This project is licensed under the MIT License.

---

**Happy Dictating! 🎤**

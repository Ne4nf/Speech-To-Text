# Implementation Plan: Voice Dictation Interface (MVP)

**Branch**: `001-voice-dictation` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-voice-dictation/spec.md`

**Note**: This template is filled in by the `/specledger.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a browser-based voice dictation interface that enables users to convert speech to text in real-time using the Web Speech API. The application will provide a centered microphone button with pulse animation, real-time text display in a textarea, and a sidebar for managing saved notes. All functionality runs client-side with LocalStorage persistence, supporting English and Vietnamese languages. The MVP focuses on three core user journeys: voice recording (P1), stopping/finalizing text (P1), and saving notes (P1), with additional enhancements for clearing text (P2), language switching (P2), deleting notes (P2), and browser compatibility handling (P3).

## Technical Context

**Language/Version**: TypeScript 5.3+, React 18+, Next.js 14 (App Router)
**Primary Dependencies**: React (18.3+), Next.js (14.1+), Tailwind CSS (3.4+), Lucide React (0.300+), Zustand (4.5+)
**Storage**: Browser LocalStorage (5-10MB capacity) with fallback to in-memory storage if disabled
**Testing**: Vitest + React Testing Library + Playwright (for browser Speech API testing)
**Target Platform**: Modern browsers with Web Speech API support (Chrome 25+, Edge 79+)
**Project Type**: Web application (single Next.js 14 app with App Router)
**Performance Goals**: <5s page load, <500ms speech-to-text display delay, <50ms state updates
**Constraints**: Client-side only (no backend), offline-capable after initial load, <250KB gzipped bundle
**Scale/Scope**: Single-user application, hundreds of notes per user, 3-5 minute recording sessions typical

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with principles from `.specify/memory/constitution.md`:

- [x] **Browser-Native First**: Web Speech API used for speech recognition (no backend services)
- [x] **Progressive Enhancement**: Core MVP defined (speech recognition + note storage + display)
- [x] **Privacy by Design**: No backend/telemetry/authentication required (data stays local)
- [x] **Simplicity & YAGNI**: Minimal dependencies, direct Web Speech API usage, flat component structure
- [x] **Accessibility First**: Keyboard navigation, ARIA labels, visual feedback, WCAG AA contrast
- [x] **Specification-First**: Spec.md complete with prioritized user stories (P1, P2, P3)
- [x] **Code Quality**: ESLint/Prettier configured, TypeScript strict mode enabled
- [x] **Issue Tracking**: Beads epic to be created via /specledger.tasks

**Complexity Violations** (if any, justify in Complexity Tracking table below):
- None identified / [List violations and justifications]

## Project Structure

### Documentation (this feature)

```text
specs/001-voice-dictation/
├── plan.md              # This file (/specledger.plan command output)
├── research.md          # Phase 0 output (/specledger.plan command)
├── data-model.md        # Phase 1 output (/specledger.plan command)
├── quickstart.md        # Phase 1 output (/specledger.plan command)
├── contracts/           # Phase 1 output (/specledger.plan command)
└── tasks.md             # Phase 2 output (/specledger.tasks command - NOT created by /specledger.plan)
```

### Source Code (repository root)

```text
# Web application (Next.js 14 App Router)
app/
├── layout.tsx           # Root layout with providers
├── page.tsx             # Main voice dictation interface
└── globals.css          # Tailwind styles

components/
├── MicrophoneButton.tsx # Prominent centered mic button with pulse animation
├── TextArea.tsx         # Real-time text display area
├── NoteSidebar.tsx      # Sidebar with saved notes list
├── LanguageSelector.tsx # Dropdown for language switching
└── BrowserSupportAlert.tsx # Warning for unsupported browsers

lib/
├── speech.ts            # Web Speech API wrapper
├── storage.ts           # LocalStorage wrapper with fallback
└── types.ts             # TypeScript types (Note, Language, etc.)

store/
└── useNoteStore.ts      # Zustand store for notes and recording state

hooks/
└── useSpeechRecognition.ts # React hook for Web Speech API (if reused 3+ times)

tests/
├── unit/                # Vitest unit tests
├── integration/         # React Testing Library integration tests
└── e2e/                 # Playwright end-to-end tests
```

**Structure Decision**: Single Next.js 14 application chosen because:
1. Frontend-only application with no backend requirements
2. Server-side rendering not needed for this client-side app
3. App Router provides modern React patterns and better performance
4. All state managed client-side via Zustand
5. No backend/ frontend separation needed
6. Monorepo structure unnecessary for single-feature app

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | No constitution violations identified |

---

## Phase 0: Research & Technical Decisions

### Research Tasks

The following technical unknowns require investigation before Phase 1 design:

1. **Web Speech API Browser Support**: Verify current browser support, language codes for Vietnamese, and API limitations
2. **React Speech Recognition Libraries**: Evaluate existing hooks/libraries vs. direct Web Speech API usage
3. **LocalStorage Limits and Fallbacks**: Research LocalStorage constraints, quota management, and fallback strategies
4. **Pulse Animation Performance**: Identify optimal CSS/animation techniques for recording indicator
5. **Zustand Best Practices**: Research patterns for LocalStorage persistence with Zustand
6. **Accessibility Patterns**: Research ARIA labels and keyboard navigation for speech interfaces
7. **Language Switching**: Investigate Web Speech API language switching behavior and state management

### Research Findings

To be documented in `research.md` after research tasks complete.

---

## Phase 1: Design Artifacts

### Data Model

To be documented in `data-model.md` after research complete.

### API Contracts

Not applicable - this is a client-side only application with no backend API.

### Component Contracts

To be documented in `contracts/` directory after research complete.

### Quickstart Guide

To be documented in `quickstart.md` after research complete.

---

## Next Steps

1. ✅ Complete Technical Context and Constitution Check
2. ⏳ **Phase 0**: Conduct research on 7 technical unknowns
3. ⏳ **Phase 1**: Generate data-model.md, contracts/, quickstart.md
4. ⏳ **Phase 1**: Update agent context with new technologies
5. ⏳ **Post-Phase 1**: Re-evaluate Constitution Check
6. ⏳ **Phase 2**: Run `/specledger.tasks` to generate task breakdown

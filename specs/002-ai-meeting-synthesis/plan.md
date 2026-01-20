# Implementation Plan: AI Meeting Synthesis Agent

**Branch**: `002-ai-meeting-synthesis` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-ai-meeting-synthesis/spec.md`

## Summary

Add AI-powered, **context-aware** transcript analysis to the Voice Dictation MVP, enabling users to extract final decisions and cross-reference them against their current project specification. Users can click "Analyze with AI" on any saved note to receive spec update suggestions that reference actual sections of their spec file (e.g., "In Section 3.1, change Database from MySQL to Redis").

**Technical Approach**: Extend existing Zustand store with analysis state, create Server Actions for Anthropic API integration and local file reading, add UI components for analysis display with spec update suggestions, and persist results in LocalStorage.

**Critical Requirement**: The AI must accept BOTH the transcript AND the current spec file as input to provide context-aware, cross-referenced analysis with specific update suggestions.

## Technical Context

**Language/Version**: TypeScript 5.3+, React 18+, Next.js 14 (App Router)
**Primary Dependencies**: @anthropic-ai/sdk (v0.71.2+), react-markdown (v9+), remark-gfm (v4+), zod (v3+)
**Storage**: Browser LocalStorage (Zustand persist middleware - reuses existing storage from SpecLedger-06k), Local file system for spec files
**Testing**: Vitest + React Testing Library (when tests added)
**Target Platform**: Modern browsers with Web Speech API support (Chrome, Edge, Safari)
**Project Type**: Web application (Next.js 14 with App Router, reading local spec files)
**Performance Goals**: Analysis completes in <15 seconds for 2000-word transcripts + spec context, <10s for 5-min transcripts
**Constraints**: Anthropic API rate limits (TBD per tier), 2000-word max transcript length, API key must remain server-side, must handle file system operations
**Scale/Scope**: Single-user application, 50 analyzed notes max, analysis <10KB per note, spec file reading integrated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with principles from `.specify/memory/constitution.md`:

- [x] **Browser-Native First**: Core speech recognition remains browser-native (Web Speech API unchanged). AI is opt-in enhancement using Server Actions for security.
- [x] **Progressive Enhancement**: Core MVP (speech recognition + note storage + display) remains fully functional without AI. Analysis is enhancement layer.
- [x] **Privacy by Design**: AI features require explicit user trigger (opt-in). Analysis stored locally only. No backend required for core features. Clear UI disclosure when data sent to external service.
- [x] **Simplicity & YAGNI**: Minimal dependencies added (4 packages). Server-side code only when necessary (API key security). Direct Anthropic SDK usage (no extra abstraction layers). Flat component structure (3 new components).
- [x] **Accessibility First**: Keyboard navigation on all AI controls. ARIA labels for screen readers. Visual feedback (loading states, error messages). WCAG AA contrast maintained.
- [x] **Specification-First**: Spec.md complete with 4 prioritized user stories (P1, P2, P2, P3). All requirements testable.
- [x] **Code Quality**: ESLint/Prettier configured from MVP. TypeScript strict mode enabled.
- [x] **Issue Tracking**: Beads epic to be created via `/specledger.tasks` (next step).

**Complexity Violations**:
- **File System Reading**: Requires reading local spec files from specs/ directory via Server Actions - **JUSTIFIED** because:
  - Uses Next.js Server Actions (server-side only, no client-side exposure)
  - Files are local project specs (not external APIs or network calls)
  - Still maintains privacy (spec content never leaves user's system, only sent to AI with user consent)
  - Simpler than external API integration (no rate limits, no auth complexity)
  - Essential for context-aware analysis functionality (core value proposition)
  - Graceful degradation if spec files missing (FR-024)
- All other principles: **No violations**

**Constitutional Amendment Compliance**: Feature aligns with v1.1.0 constitution amendment that added Anthropic API via Server Actions to Technology Standards. All AI/LLM integration guidelines followed:
- Server Actions used for all Anthropic API calls ✅
- Server Actions also handle local file system reading (spec files) ✅
- API key stored in environment variables (never client-side) ✅
- AI features opt-in with clear disclosure ✅
- Graceful fallback if API key unavailable ✅
- Graceful degradation if spec files missing ✅

## Project Structure

### Documentation (this feature)

```text
specs/002-ai-meeting-synthesis/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technical research (COMPLETE)
├── data-model.md        # Entity definitions (COMPLETE)
├── quickstart.md        # Developer guide (COMPLETE)
├── contracts/           # Component specifications (COMPLETE)
│   ├── AnalyzeButton.md
│   ├── AnalysisResult.md
│   └── ErrorDisplay.md
├── checklists/
│   └── requirements.md  # Quality validation (ALL PASSED)
└── tasks.md             # To be created by /specledger.tasks
```

### Source Code (repository root)

**Extending Existing Structure** (from SpecLedger-06k):

```text
app/
├── actions/
│   ├── analyze-transcript.ts     # NEW: Server Action for Anthropic API
│   ├── read-spec-file.ts         # NEW: Server Action for reading spec files
│   └── index.ts                   # NEW: Actions barrel file
├── layout.tsx                    # EXISTING (unchanged)
├── page.tsx                      # UPDATED: Added language switcher and paste/upload buttons
└── globals.css                   # EXISTING (unchanged)

components/
├── MicrophoneButton.tsx          # EXISTING (unchanged)
├── TextArea.tsx                  # EXISTING (unchanged)
├── SaveNoteButton.tsx            # EXISTING (unchanged)
├── NoteSidebar.tsx               # EXISTING (EXTEND: add AnalyzeButton)
├── AnalyzeButton.tsx             # NEW: Analysis trigger button
├── AnalysisResult.tsx            # NEW: Markdown result display
├── ErrorDisplay.tsx              # NEW: Error message display (not yet implemented)
├── PasteModal.tsx                # NEW: Modal for pasting transcript content
├── PasteButton.tsx               # NEW: Button to open paste modal
├── UploadButton.tsx              # NEW: Button to upload transcript files
└── LanguageSwitcher.tsx          # NEW: Language selector (English/Vietnamese)

store/
└── useStore.ts                   # EXISTING (EXTEND: add analysis state/actions)

types/
├── index.ts                      # EXISTING (EXTEND: add NoteAnalysis type)
└── analysis.ts                   # NEW: Analysis-specific types

lib/
├── speech.ts                     # EXISTING (unchanged)
└── storage.ts                    # EXISTING (unchanged)
```

**Structure Decision**: Extending existing single-project Next.js application structure. No new directories needed. AI feature integrates into existing Voice Dictation MVP as enhancement layer. Server Actions follow Next.js 14 App Router conventions.

## Complexity Tracking

> No violations - this section intentionally left empty

## Phase 0: Research Complete ✅

**Deliverable**: [research.md](./research.md)

**Key Decisions**:
1. **Anthropic SDK**: Use official `@anthropic-ai/sdk` (v0.71.2+) for TypeScript support and built-in error handling
2. **Error Handling**: Retry logic with exponential backoff for rate limits (429 errors)
3. **Prompt Engineering**: Structured system prompt with JSON output format for decision extraction
4. **Markdown Rendering**: `react-markdown` with Tailwind typography plugin for styled output
5. **State Management**: Extend existing Zustand store (no new storage layer needed)

**All Technical Unknowns Resolved**:
- ✅ Anthropic API integration pattern
- ✅ Server Actions security model
- ✅ Error handling and resilience
- ✅ Prompt strategy for noise filtering
- ✅ Markdown rendering approach
- ✅ Zustand store extensions
- ✅ Performance optimization
- ✅ Environment configuration
- ✅ Accessibility requirements
- ✅ Testing strategy

## Phase 1: Design Complete ✅

### Data Model ✅

**Deliverable**: [data-model.md](./data-model.md)

**Entities Defined**:
- `Note` (extended with optional `analysis` field)
- `NoteAnalysis` (new entity with content, timestamp, mode, version)
- `AnalysisResult` (internal parsing structure)

**Store Extensions**:
- 3 new state fields: `isAnalyzing`, `analyzingNoteId`, `analysisError`
- 4 new actions: `analyzeNote`, `updateNoteAnalysis`, `clearNoteAnalysis`, `setAnalysisError`

**Persistence**: Reuses existing Zustand persist middleware, no LocalStorage schema changes needed.

### Component Contracts ✅

**Deliverables**: [contracts/](./contracts/) directory

**Components Specified**:
1. **AnalyzeButton** (P1): Triggers analysis, shows loading state, prevents concurrent analysis
2. **AnalysisResult** (P1): Displays Markdown result with timestamp, dismiss/re-analyze actions
3. **ErrorDisplay** (P2): Shows user-friendly error messages with retry/dismiss

All contracts include:
- Props interfaces with TypeScript types
- Behavior specifications for all states
- Accessibility requirements (ARIA, keyboard nav)
- Styling with Tailwind classes
- Integration examples
- Testing strategies

### Quickstart Guide ✅

**Deliverable**: [quickstart.md](./quickstart.md)

**Content**:
- Prerequisites and installation
- Environment variable setup
- Quick test walkthrough
- Component usage examples
- Store usage patterns
- Server Action implementation guide
- Troubleshooting section
- Performance tips

### Agent Context Update ⚠️

**Action Required**: Run `.specify/scripts/bash/update-agent-context.sh claude` to update agent-specific context with new technologies.

**New Technologies to Add**:
- `@anthropic-ai/sdk`
- `react-markdown`
- `remark-gfm`
- `zod`

**Constitutional Updates**: Already reflected in v1.1.0 amendment.

## Re-Evaluated Constitution Check (Post-Design)

All checks remain PASSED. Design decisions strengthened compliance:

**Enhanced Compliance**:
- **Privacy by Design**: Clear visual distinction between raw transcript (gray background) and AI analysis (white background with border). User must explicitly click "Analyze" button. Spec file reading happens server-side via Server Actions (no client-side exposure). Spec content only sent to AI with user consent.
- **Accessibility First**: Component contracts specify ARIA labels, keyboard navigation, focus management, and screen reader support for all new UI elements.
- **Simplicity & YAGNI**: Only 3 new components, extending existing store (no new state management layer), direct Anthropic SDK usage (no abstraction). Local file reading uses Node.js `fs` module directly (no external dependencies).
- **Progressive Enhancement**: All new features optional. Core voice dictation works without AI. Analysis degrades gracefully on errors or missing spec files (FR-024).

**Context-Aware Analysis Compliance**: The addition of spec file reading maintains all constitutional principles:
- Uses Server Actions (server-side only, secure)
- Reads local project files (not external APIs)
- Graceful degradation if spec files missing
- User must opt-in to analysis (explicit "Analyze" button)
- No data persistence beyond LocalStorage (user-controlled)

**No New Violations**: Design phase did not introduce any constitutional concerns.

---

## Implementation Status & Enhancements

**As of January 16, 2026**

### ✅ Completed Phases

**Phase 1: Setup** (2/2 tasks) ✅
- Dependencies installed (@anthropic-ai/sdk, react-markdown, remark-gfm, zod, date-fns)
- Environment variables configured (.env.local, .env.example)

**Phase 2: Foundational** (5/5 tasks) ✅
- TypeScript types defined (including SpecFile, SpecUpdateSuggestion for context-aware analysis)
- Server Actions created (analyze-transcript.ts, read-spec-file.ts)
- Zustand store extended with AI analysis state
- All code compiles with TypeScript strict mode

**Phase 3: User Story 1 - MVP** (5/5 tasks) ✅
- AnalyzeButton component created with loading states and ARIA labels
- AnalysisResult component with Markdown rendering and spec update highlighting
- NoteSidebar integration with AnalyzeButton
- **ENHANCEMENT**: PasteModal and PasteButton for pasting transcript content
- **ENHANCEMENT**: UploadButton and file upload handler for .txt/.md files

### 🆕 Post-MVP Enhancements

**Multiple Input Methods** (Beyond original scope)
Users can now provide transcripts via three methods:
1. **Voice Recording** (original MVP) - Web Speech API with real-time transcription
2. **Paste Content** - Modal dialog for pasting Zoom transcripts, meeting notes, etc.
3. **Upload Files** - File upload accepts .txt and .md files (max 1MB)

**Language Support Enhancement**
- LanguageSwitcher component added for English/Vietnamese selection
- Vietnamese voice recognition fully functional via Web Speech API
- AI can analyze Vietnamese transcripts and provide insights in Vietnamese

**Technical Additions**:
- `components/PasteModal.tsx` - Modal with textarea, validation (min 10 chars)
- `components/PasteButton.tsx` - Clipboard icon button
- `components/UploadButton.tsx` - File input with FileReader API
- `components/LanguageSwitcher.tsx` - Language toggle (EN/VI)
- `app/actions/index.ts` - Actions barrel file
- Updated `app/page.tsx` with three-button layout and language switcher
- New functional requirements: FR-025 through FR-030 (paste/upload functionality)

### 📊 Implementation Statistics

**Total Issues Created**: 27
- **Closed**: 15 tasks ✅
- **Open**: 12 tasks (remaining P2/P3 enhancements)

**Code Delivered**:
- 8 new components created
- 2 Server Actions implemented
- 4 existing components extended
- Full TypeScript type safety maintained
- Zero compilation errors

---

## Next Steps

**Phase 2: Task Breakdown**

Run `/specledger.tasks` to generate:
- Beads epic for feature tracking
- Task breakdown organized by user story
- Implementation tasks with dependencies
- Acceptance criteria for each task

**Expected Tasks** (by user story):
- **Setup**: Install dependencies, configure environment
- **Foundational**: Create Server Action, extend Zustand store, add types
- **User Story 1 (P1)**: Create AnalyzeButton, AnalysisResult, integrate with sidebar
- **User Story 2 (P2)**: Implement persistence, re-analysis, visual indicators
- **User Story 3 (P2)**: Create ErrorDisplay, error handling, user guidance
- **User Story 4 (P3)**: Add analysis mode selector (if time permits)

**Ready for Implementation**: All research complete, data model defined, components specified. Ready for task generation and development.

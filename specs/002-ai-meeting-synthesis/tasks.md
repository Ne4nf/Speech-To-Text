---
description: "Task list template for feature implementation"
---

# Tasks Index: AI Meeting Synthesis Agent

Beads Issue Graph Index into the tasks and phases for this feature implementation.
This index does **not contain tasks directly**—those are fully managed through Beads CLI.

## Feature Tracking

* **Beads Epic ID**: `SpecLedger-5lj`
* **User Stories Source**: `specs/002-ai-meeting-synthesis/spec.md`
* **Research Inputs**: `specs/002-ai-meeting-synthesis/research.md`
* **Planning Details**: `specs/002-ai-meeting-synthesis/plan.md`
* **Data Model**: `specs/002-ai-meeting-synthesis/data-model.md`
* **Contract Definitions**: `specs/002-ai-meeting-synthesis/contracts/`

## Beads Query Hints

Use the `bd` CLI to query and manipulate the issue graph:

```bash
# Find all open tasks for this feature
bd list --label spec:002-ai-meeting-synthesis --status open --limit 20

# Find ready tasks to implement
bd ready --label spec:002-ai-meeting-synthesis --limit 5

# See dependencies for issue
bd dep tree SpecLedger-5lj

# View issues by component
bd list --label 'component:ui' --label 'spec:002-ai-meeting-synthesis' --limit 5

# View issues by story
bd list --label 'story:US1' --label 'spec:002-ai-meeting-synthesis' --limit 5

# Show all phases
bd list --type feature --label 'spec:002-ai-meeting-synthesis'

# Show progress stats
bd stats --label spec:002-ai-meeting-synthesis
```

## Tasks and Phases Structure

This feature follows Beads' 2-level graph structure:

* **Epic**: `SpecLedger-5lj` → represents the whole feature
* **Phases**: Beads issues of type `feature`, child of the epic
  * Phase = a user story group or technical milestone (e.g., setup, foundational, US1)
* **Tasks**: Issues of type `task`, children of each feature issue (phase)

## Convention Summary

| Type    | Description                  | Labels                                 |
| ------- | ---------------------------- | -------------------------------------- |
| epic    | Full feature epic            | `spec:002-ai-meeting-synthesis`      |
| feature | Implementation phase / story | `phase:<name>`, `story:US#`            |
| task    | Implementation task          | `component:<x>`, `requirement:fr-id`   |

## Agent Execution Flow

MCP agents and AI workflows should:

1. **Assume `bd init` already done** by `specify init`
2. **Use `bd create`** to directly generate Beads issues
3. **Set metadata and dependencies** in the graph, not in markdown
4. **Use this markdown only as a navigational anchor**

> Agents MUST NOT output tasks into this file. They MUST use Beads CLI to record all task and phase structure.

## Example Queries for Agents

```bash
# Get all tasks in tree structure for the feature
bd dep tree --reverse SpecLedger-5lj

# get all tasks by label
bd list --label spec:002-ai-meeting-synthesis --label story:US1

# Add a new task
bd create "Implement OAuth redirect handler" -t task --parent SpecLedger-5lj.3 -l spec:002-ai-meeting-synthesis -l component:core

# Update notes on a task
bd update SpecLedger-XXXX --notes "Re-use helper functions from speech module"

# Add a comment to a task based on research or findings during implementation
bd comments add SpecLedger-XXXX "Additional research identified bcrypt as best hashing algo"
```

# Mark task as completed with context

```bash
bd close SpecLedger-XXXX --reason "Completed with Anthropic API integration, <15s analysis time achieved"
```

or use `update` to set status and additional fields:

```bash
bd update SpecLedger-XXXX --status closed --notes "Completed with Anthropic API integration, <15s analysis time achieved"
```

## Status Tracking

Status is tracked only in Beads:

* **Open** → default
* **In Progress** → task being worked on
* **Blocked** → dependency unresolved
* **Closed** → complete

Use `bd ready`, `bd blocked`, `bd stats` with appropriate filters to query progress.

---

# Phase Breakdown

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

**Feature Issue**: `SpecLedger-5lj.1`
**Priority**: P1
**Stories**: None (infrastructure)

### Tasks

- **SpecLedger-5lj.1.1**: Install AI dependencies (@anthropic-ai/sdk, react-markdown, remark-gfm, zod)
  - **Component**: `infra`
  - **Acceptance**: All packages installed, versions compatible, no conflicts

- **SpecLedger-5lj.1.2**: Configure environment variables (.env.local, .env.example, .gitignore)
  - **Component**: `infra`
  - **Acceptance**: .env.local created, added to .gitignore, .env.example template committed

**Checkpoint**: Development environment ready with all dependencies installed and API key configuration documented

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**Feature Issue**: `SpecLedger-5lj.2`
**Priority**: P1
**Stories**: US1, US2, US3 (all depend on this)

### Tasks

- **SpecLedger-5lj.2.1**: Define TypeScript types for AI analysis (NoteAnalysis, AnalysisMode, AnalysisResult)
  - **Component**: `core`
  - **Stories**: US1
  - **Acceptance**: types/analysis.ts created with all interfaces, types/index.ts exports, TypeScript compiles

- **SpecLedger-5lj.2.2**: Extend Zustand store with AI analysis state (isAnalyzing, analyzingNoteId, analysisError, analyzeNote action)
  - **Component**: `core`
  - **Stories**: US1, US2
  - **Requirements**: FR-008
  - **Acceptance**: Store extended with new fields and actions, persist middleware includes analysis, analyzeNote calls Server Action
  - **UPDATED**: analyzeNote now accepts optional specPath parameter for context-aware analysis

- **SpecLedger-5lj.2.3**: Create Server Action for Anthropic API (analyze-transcript.ts with 'use server')
  - **Component**: `core`
  - **Stories**: US1
  - **Requirements**: FR-002
  - **Acceptance**: Server Action created, API key validated, transcript length checked, Anthropic API call works, errors handled
  - **UPDATED**: Accepts optional specFile parameter and enhances prompt with spec context when available

- **SpecLedger-5lj.2.4**: Add TypeScript types for spec file reading (SpecFile, SpecUpdateSuggestion)
  - **Component**: `core`
  - **Stories**: US1
  - **Requirements**: FR-023
  - **Acceptance**: types/analysis.ts extended with SpecFile and SpecUpdateSuggestion interfaces, AnalysisResult extended with specUpdates array

- **SpecLedger-5lj.2.5**: Create Server Action for reading local spec files (read-spec-file.ts)
  - **Component**: `core`
  - **Stories**: US1
  - **Requirements**: FR-023, FR-024
  - **Acceptance**: Server Action reads specs/{specPath}/spec.md, validates paths, graceful degradation on missing files, returns SpecFile object

**Checkpoint**: Foundation ready - User Story implementation can now proceed in parallel

**Context-Aware Analysis Infrastructure**: New tasks (2.4, 2.5) enable reading local spec files and providing context to AI for cross-referenced spec update suggestions.

---

## Phase 3: User Story 1 - Analyze Transcript with AI (Priority: P1) 🎯 MVP

**Goal**: Users can click "Analyze with AI" button on saved notes to extract final decisions and action items, filtering out brainstorming noise. With context-aware analysis, AI cross-references decisions with project specification and suggests specific spec updates.

**Purpose**: This is the core AI functionality. Without analysis, users must manually parse transcripts. Delivers immediate value by transforming unstructured notes into structured outputs with cross-referenced spec update suggestions.

**Feature Issue**: `SpecLedger-5lj.3`
**Priority**: P1
**Stories**: US1

**Independent Test**: User can select saved note with messy brainstorming, click "Analyze with AI", and receive clean list of decisions without noise. When spec file is available, AI provides specific spec update suggestions (e.g., "In Section 3.1, change Database from MySQL to Redis"). Delivers value by saving time and improving clarity.

### Implementation Tasks

- **SpecLedger-5lj.3.1**: Create AnalyzeButton component with loading states and visual feedback
  - **Component**: `ui`
  - **Requirements**: FR-001, FR-003, FR-016
  - **Acceptance**: Button renders with correct states (idle, loading, hasAnalysis), onClick triggers analyzeNote, ARIA labels present, keyboard accessible
  - **UPDATED**: Accepts optional specPath prop and passes to onAnalyze callback

- **SpecLedger-5lj.3.2**: Create AnalysisResult component to display Markdown analysis with visual distinction
  - **Component**: `ui`
  - **Requirements**: FR-004, FR-011, FR-018, FR-019
  - **Acceptance**: Markdown renders with Tailwind typography, visual distinction clear (white bg, purple border), timestamp displays, dismiss/re-analyze buttons work
  - **UPDATED**: Highlights "Spec Updates" section with special styling, displays section references and change types

- **SpecLedger-5lj.3.3**: Integrate AnalyzeButton into NoteSidebar for each note card
  - **Component**: `ui`
  - **Requirements**: FR-001
  - **Acceptance**: Button appears on each note, positioned correctly, layout responsive, triggers store action
  - **UPDATED**: Passes specPath to AnalyzeButton (MVP: hardcoded '001-voice-dictation')

- **SpecLedger-5lj.3.4**: Add Paste Transcript button and modal (NEW)
  - **Component**: `ui`
  - **Requirements**: User can paste any text content for analysis
  - **Acceptance**: PasteModal with textarea created, PasteButton with clipboard icon added to page, pasted content saves as new note, new note appears in sidebar and can be analyzed

- **SpecLedger-5lj.3.5**: Add Upload File button and handler (NEW)
  - **Component**: `ui`
  - **Requirements**: User can upload .txt/.md files for analysis
  - **Acceptance**: UploadButton with file input created, accepts .txt/.md files, file content read using FileReader, uploaded content creates new note in store

**Checkpoint**: At this point, users can analyze notes and see AI-generated decisions with optional spec update suggestions. Users can also paste or upload transcript content from external sources. Core AI functionality complete with multiple input methods!

---

## Phase 4: User Story 2 - Manage AI Analysis Results (Priority: P2)

**Goal**: Analysis results persist across sessions and can be re-generated. Visual indicators show which notes have analysis, with distinction between context-aware and regular analysis.

**Purpose**: Persistence improves UX. Core value delivered in US1; this makes it more convenient and reliable. Visual indicators help users identify notes with spec update suggestions.

**Feature Issue**: `SpecLedger-5lj.4`
**Priority**: P2
**Stories**: US2

**Independent Test**: User can analyze note, refresh browser, analysis persists. Re-analysis replaces previous result. Visual indicators distinguish context-aware analysis (with spec updates) from regular analysis.

### Implementation Tasks

- **SpecLedger-5lj.4.1**: Add visual indicator for analyzed notes in sidebar (badge, icon, or checkmark)
  - **Component**: `ui`
  - **Requirements**: FR-017
  - **Acceptance**: Indicator appears on notes with analysis, visually distinct, screen reader announces it, consistent styling

- **SpecLedger-5lj.4.2**: Add visual indicator for context-aware analysis in sidebar (NEW)
  - **Component**: `ui`
  - **Requirements**: FR-019
  - **Acceptance**: Sparkles icon (✨) for notes with spec updates, checkmark (✓) for regular analysis, tooltip explains difference, ARIA labels distinguish types

**Checkpoint**: At this point, Users 1 AND 2 are complete - full analysis lifecycle works with persistence and visual indicators

---

## Phase 5: User Story 3 - Handle AI Service Errors (Priority: P2)

**Goal**: Users see clear, actionable error messages when AI service fails or is unavailable.

**Purpose**: Error handling important for UX but doesn't block core functionality. Voice dictation works without AI.

**Feature Issue**: `SpecLedger-5lj.5`
**Priority**: P2
**Stories**: US3

**Independent Test**: User triggers error scenarios and sees helpful messages with recovery guidance.

### Implementation Tasks

- **SpecLedger-5lj.5.1**: Create ErrorDisplay component with inline and banner variants, error categorization
  - **Component**: `ui`
  - **Requirements**: FR-012, FR-013, FR-014, FR-015
  - **Acceptance**: Component renders with error icon/message, retry/dismiss buttons, variant switching works, ARIA compliant

- **SpecLedger-5lj.5.2**: Integrate error handling in UI components (wire up store errors to ErrorDisplay)
  - **Component**: `ui`
  - **Requirements**: FR-012
  - **Acceptance**: Errors display when analysisError set, retry works, dismiss clears error, voice dictation unaffected

**Checkpoint**: At this point, Users 1, 2, AND 3 are complete - full AI feature with error handling

---

## Phase 6: Polish & Cross-Cutting Concerns (Priority: P3)

**Purpose**: Improvements that affect multiple user stories and overall UX quality

**Feature Issue**: `SpecLedger-5lj.6`
**Priority**: P3

### Tasks

- **SpecLedger-5lj.6.1**: Add concurrent analysis prevention (only one analysis at a time)
  - **Component**: `core`
  - **Requirements**: FR-016
  - **Acceptance**: Concurrent attempts blocked, single analysis active, loading state global, race conditions handled

- **SpecLedger-5lj.6.2**: Add accessibility enhancements (focus management, keyboard shortcuts, ARIA improvements)
  - **Component**: `ui`
  - **Acceptance**: Focus moves logically, keyboard shortcuts work, ARIA descriptions complete, screen reader friendly

- **SpecLedger-5lj.6.3**: Add responsive design and mobile optimizations (touch targets, mobile layout)
  - **Component**: `ui`
  - **Acceptance**: Components render on mobile, buttons 44px+ height, no horizontal scroll, text readable, performance acceptable

- **SpecLedger-5lj.6.4**: Add performance optimizations and smooth animations (transitions, debouncing, memoization)
  - **Component**: `core`
  - **Acceptance**: Fade-in animations, smooth transitions, no double-clicks, Markdown performant, 60fps animations, performance budgets met

**Checkpoint**: Feature complete with polish - ready for production deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - Extends US1 functionality
  - User Story 3 (P2): Can start after Foundational - Independent error handling
- **Polish (Phase 6)**: Depends on US1-US3 completion (requires UI components to polish)

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - Core analysis functionality
- **User Story 2 (P2)**: Can start after Foundational - Requires AnalyzeButton from US1
- **User Story 3 (P2)**: Can start after Foundational - Independent error handling
- **Polish**: Depends on US1-US3 complete

### Parallel Execution Opportunities

**After Foundational Phase Complete**:
- **Team A**: Work on US1 (AnalyzeButton, AnalysisResult) - P1 priority
- **Team B**: Work on US3 (ErrorDisplay, error handling) - P2 priority
- **Team C**: Work on Polish tasks (concurrent prevention, accessibility) - P3 priority

All can proceed independently where dependencies allow!

---

## MVP Scope

**Suggested MVP** = **User Story 1** (Phase 3) + **Foundational** (Phase 2)

This delivers:
- ✅ Analyze transcripts with AI
- ✅ Display Markdown-formatted results
- ✅ Visual distinction between raw and AI content
- ✅ Basic error handling (built into Server Action)
- ✅ Context-aware analysis with spec file reading (NEW)
- ✅ Spec update suggestions with section references (NEW)

**MVP is independently testable** and delivers the core AI value proposition with context-aware analysis.

**Context-Aware Analysis**: MVP includes reading local spec files and providing cross-referenced spec update suggestions. This is the key differentiator that transforms generic AI analysis into actionable spec updates.

---

## Incremental Delivery Strategy

1. **Iteration 1 (MVP)**: User Story 1 (P1)
   - Users can analyze transcripts and see AI decisions
   - Core AI functionality complete
   - Ready for user testing and feedback

2. **Iteration 2**: User Stories 2 & 3 (P2)
   - Add persistence and visual indicators (US2)
   - Add error handling and user guidance (US3)
   - Improved UX and reliability

3. **Iteration 3**: Polish (P3)
   - Concurrent analysis prevention
   - Accessibility enhancements
   - Mobile responsive design
   - Performance optimizations

---

## Beads Query Examples

```bash
# Show all P1 tasks (MVP)
bd list --label story:US1 --label spec:002-ai-meeting-synthesis

# Show all P2 tasks (enhancements)
bd list --label story:US2,story:US3 --label spec:002-ai-meeting-synthesis

# Show all UI components
bd list --label component:ui --label spec:002-ai-meeting-synthesis

# Show all core infrastructure
bd list --label component:core --label spec:002-ai-meeting-synthesis

# Find ready tasks (no unresolved dependencies)
bd ready --label spec:002-ai-meeting-synthesis

# Show task tree
bd dep tree --reverse SpecLedger-5lj
```

---

> This file is intentionally light and index-only. Implementation data lives in Beads. Update this file only to point humans and agents to canonical query paths and feature references.

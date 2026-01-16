---
description: "Task list template for feature implementation"
---

# Tasks Index: Voice Dictation Interface (MVP)

Beads Issue Graph Index into the tasks and phases for this feature implementation.
This index does **not contain tasks directly**—those are fully managed through Beads CLI.

## Feature Tracking

* **Beads Epic ID**: `SpecLedger-06k`
* **User Stories Source**: `specs/001-voice-dictation/spec.md`
* **Research Inputs**: `specs/001-voice-dictation/research.md`
* **Planning Details**: `specs/001-voice-dictation/plan.md`
* **Data Model**: `specs/001-voice-dictation/data-model.md`
* **Contract Definitions**: `specs/001-voice-dictation/contracts/`

## Beads Query Hints

Use the `bd` CLI to query and manipulate the issue graph:

```bash
# Find all open tasks for this feature
bd list --label spec:001-voice-dictation --status open --limit 10

# Find ready tasks to implement
bd ready --label spec:001-voice-dictation --limit 5

# See dependencies for issue
bd dep tree SpecLedger-06k

# View issues by component
bd list --label 'component:ui' --label 'spec:001-voice-dictation' --limit 5

# View issues by story
bd list --label 'story:US1' --label 'spec:001-voice-dictation' --limit 5

# Define dependencies
bd dep add [from-issue-id] [to-issue-id] --type [dependency-type]

# Show all phases
bd list --type feature --label 'spec:001-voice-dictation'
```

## Tasks and Phases Structure

This feature follows Beads' 2-level graph structure:

* **Epic**: `SpecLedger-06k` → represents the whole feature
* **Phases**: Beads issues of type `feature`, child of the epic
  * Phase = a user story group or technical milestone (e.g., setup, foundational, US1)
* **Tasks**: Issues of type `task`, children of each feature issue (phase)

## Convention Summary

| Type    | Description                  | Labels                                 |
| ------- | ---------------------------- | -------------------------------------- |
| epic    | Full feature epic            | `spec:001-voice-dictation`            |
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
bd dep tree --reverse SpecLedger-06k

# get all tasks by label
bd list --label spec:001-voice-dictation --label story:US1

# Add a new task
bd create "Implement OAuth redirect handler" -t task --parent SpecLedger-06k.3 -l spec:001-voice-dictation -l component:core

# Update notes on a task
bd update SpecLedger-XXXX --notes "Re-use helper functions from speech module"

# Add a comment to a task based on research or findings during implementation
bd comments add SpecLedger-XXXX "Additional research identified bcrypt as best hashing algo"
```

# Mark task as completed with context

```bash
bd close SpecLedger-XXXX --reason "Completed with Web Speech API integration, <500ms latency achieved"
```

or use `update` to set status and additional fields.

```bash
bd update SpecLedger-XXXX --status closed --notes "Completed with Web Speech API integration, <500ms latency achieved"
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

**Purpose**: Project initialization and basic structure

**Feature Issue**: `SpecLedger-06k.1`
**Priority**: P1
**Stories**: None (infrastructure)

### Tasks

- **SpecLedger-06k.1.1**: Initialize Next.js 14 project with App Router and TypeScript
  - **Component**: `infra`
  - **Acceptance**: Next.js project created, TypeScript compiles, App Router structure in place, dev server runs

- **SpecLedger-06k.1.2**: Install and configure dependencies (React, Tailwind, Zustand, Lucide)
  - **Component**: `infra`
  - **Acceptance**: All packages installed, Tailwind config includes pulse animation

- **SpecLedger-06k.1.3**: Create project directory structure
  - **Component**: `infra`
  - **Acceptance**: All directories created (app/, components/, lib/, store/, hooks/, tests/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**Feature Issue**: `SpecLedger-06k.2`
**Priority**: P1
**Stories**: US1, US2, US3 (all P1 stories depend on this)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tasks

- **SpecLedger-06k.2.1**: Define TypeScript types (Note, RecordingSession, Language)
  - **Component**: `core`
  - **Stories**: US1, US3
  - **Acceptance**: `lib/types.ts` created with all types defined

- **SpecLedger-06k.2.2**: Create Zustand store with persist middleware
  - **Component**: `core`
  - **Stories**: US3
  - **Requirements**: FR-009
  - **Acceptance**: Zustand store created, persist middleware configured, notes persist to LocalStorage

- **SpecLedger-06k.2.3**: Implement Web Speech API wrapper
  - **Component**: `core`
  - **Stories**: US1, US2
  - **Requirements**: FR-002, FR-003, FR-012
  - **Acceptance**: `lib/speech.ts` created, Web Speech API wrapped, language switching functional

- **SpecLedger-06k.2.4**: Implement LocalStorage wrapper with fallback
  - **Component**: `core`
  - **Stories**: US3
  - **Requirements**: FR-009
  - **Acceptance**: `lib/storage.ts` created, in-memory fallback works

- **SpecLedger-06k.2.5**: Create root layout with providers
  - **Component**: `core`
  - **Acceptance**: `app/layout.tsx` created, Tailwind CSS imported, metadata configured

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Start Voice Recording (Priority: P1) 🎯 MVP

**Goal**: Enable users to click microphone, grant permission, and see real-time transcript as they speak

**Purpose**: This is the core functionality - the application has no purpose without voice recording

**Feature Issue**: `SpecLedger-06k.3`
**Priority**: P1
**Stories**: US1

**Independent Test**: User can click microphone, grant permission, speak, and see text appear in textarea

### Implementation Tasks

- **SpecLedger-06k.3.1**: Create MicrophoneButton component with pulse animation
  - **Component**: `ui`
  - **Requirements**: FR-001, FR-006
  - **Acceptance**: Component renders, pulse animation works during recording, ARIA labels present, keyboard accessible

- **SpecLedger-06k.3.2**: Create TextArea component for real-time transcript display
  - **Component**: `ui`
  - **Requirements**: FR-004
  - **Acceptance**: TextArea displays transcript, updates in real-time, ARIA live region configured

- **SpecLedger-06k.3.3**: Wire MicrophoneButton to Web Speech API in Zustand store
  - **Component**: `core`
  - **Requirements**: FR-002, FR-003
  - **Acceptance**: Clicking starts recognition, transcript appears, recording state updates, visual feedback works

**Checkpoint**: At this point, users can record speech and see text appear - core MVP functionality complete!

---

## Phase 4: User Story 2 - Stop Recording and Finalize Text (Priority: P1)

**Goal**: Users can stop active recording and finalized text remains in textarea

**Purpose**: Completes the recording flow - essential for full MVP experience

**Feature Issue**: `SpecLedger-06k.4`
**Priority**: P1
**Stories**: US2

**Independent Test**: User can record speech, click stop, and verify text persists

### Implementation Tasks

- **SpecLedger-06k.4.1**: Update MicrophoneButton to show Stop button during recording
  - **Component**: `ui`
  - **Requirements**: FR-005
  - **Acceptance**: Stop button appears when recording, stops recognition on click, pulse animation ceases

- **SpecLedger-06k.4.2**: Implement stopRecording action in Zustand store
  - **Component**: `core`
  - **Requirements**: FR-005
  - **Acceptance**: Stop action calls speech API stop, recording state updates, interim transcript cleared

**Checkpoint**: At this point, Users 1 AND 2 are fully functional - complete record/stop flow works

---

## Phase 5: User Story 3 - Save Note to Sidebar (Priority: P1) 🎯 MVP

**Goal**: Users can save dictated notes to sidebar and notes persist across browser sessions

**Purpose**: Saving notes is the primary value proposition - essential for application to be useful

**Feature Issue**: `SpecLedger-06k.5`
**Priority**: P1
**Stories**: US3

**Independent Test**: User can save note and see it in sidebar; notes persist after refresh

### Implementation Tasks

- **SpecLedger-06k.5.1**: Create NoteSidebar component
  - **Component**: `ui`
  - **Requirements**: FR-008, FR-014
  - **Acceptance**: Sidebar renders, displays notes list, most recent first, empty state shown

- **SpecLedger-06k.5.2**: Implement addNote action in Zustand store
  - **Component**: `core`
  - **Requirements**: FR-007
  - **Acceptance**: addNote creates Note object, adds to notes array, persists to LocalStorage

- **SpecLedger-06k.5.3**: Create Save Note button and wire to addNote action
  - **Component**: `ui`
  - **Requirements**: FR-007
  - **Acceptance**: Save button appears, clicking saves note to sidebar and LocalStorage, validation prevents empty saves

**Checkpoint**: At this point, Users 1, 2, AND 3 are complete - FULL MVP IS FUNCTIONAL! Users can record, stop, and save notes.

---

## Phase 6: User Story 4 - Clear Text Area (Priority: P2)

**Goal**: Users can clear textarea with one click to start fresh

**Purpose**: Convenience feature - improves UX but not blocking for MVP

**Feature Issue**: `SpecLedger-06k.6`
**Priority**: P2
**Stories**: US4

**Independent Test**: User can enter text, click clear, and verify textarea is empty

### Implementation Tasks

- **SpecLedger-06k.6.1**: Create Clear button component
  - **Component**: `ui`
  - **Requirements**: FR-010
  - **Acceptance**: Clear button renders, visible in UI

- **SpecLedger-06k.6.2**: Implement clear functionality (stop recording if active, clear textarea)
  - **Component**: `core`
  - **Requirements**: FR-010
  - **Acceptance**: Clear button stops recording if active, empties transcript in store, textarea updates

**Checkpoint**: User Story 4 complete - clear functionality works

---

## Phase 7: User Story 5 - Switch Language (Priority: P2)

**Goal**: Users can select Vietnamese language and speech recognition uses Vietnamese

**Purpose**: Accessibility for international users - enhances value but not blocking

**Feature Issue**: `SpecLedger-06k.7`
**Priority**: P2
**Stories**: US5

**Independent Test**: User can select Vietnamese, speak, and see Vietnamese text

### Implementation Tasks

- **SpecLedger-06k.7.1**: Create LanguageSelector dropdown component
  - **Component**: `ui`
  - **Requirements**: FR-011
  - **Acceptance**: Dropdown renders, shows English and Vietnamese options, keyboard accessible

- **SpecLedger-06k.7.2**: Implement setLanguage action in Zustand store
  - **Component**: `core`
  - **Requirements**: FR-012
  - **Acceptance**: setLanguage updates language state, persists for session

- **SpecLedger-06k.7.3**: Wire language selector to speech API for language switching
  - **Component**: `core`
  - **Requirements**: FR-012
  - **Acceptance**: Language change stops/starts recognition with new language, next recording uses selected language

**Checkpoint**: User Story 5 complete - language switching works

---

## Phase 8: User Story 6 - Browser Compatibility Handling (Priority: P3)

**Goal**: Display helpful warning when browser doesn't support Web Speech API

**Purpose**: Edge case handling - nice-to-have for user guidance

**Feature Issue**: `SpecLedger-06k.8`
**Priority**: P3
**Stories**: US6

**Independent Test**: User opens in unsupported browser and sees clear message

### Implementation Tasks

- **SpecLedger-06k.8.1**: Create BrowserSupportAlert component
  - **Component**: `ui`
  - **Requirements**: FR-013
  - **Acceptance**: Alert renders with warning message, Chrome/Edge links, close button, WCAG AA contrast

- **SpecLedger-06k.8.2**: Implement browser support detection logic
  - **Component**: `core**
  - **Requirements**: FR-013
  - **Acceptance**: Detection checks for window.SpeechRecognition or webkitSpeechRecognition, returns boolean

- **SpecLedger-06k.8.3**: Integrate browser detection with alert display
  - **Component**: `ui`
  - **Requirements**: FR-013
  - **Acceptance**: Alert shows when unsupported, hidden when supported, hides main UI when unsupported

**Checkpoint**: User Story 6 complete - browser compatibility warning works

---

## Phase 9: User Story 7 - Delete Saved Note (Priority: P2)

**Goal**: Users can delete notes from sidebar to manage saved notes

**Purpose**: Important for long-term usability - prevents cluttered sidebar

**Feature Issue**: `SpecLedger-06k.9`
**Priority**: P2
**Stories**: US7

**Independent Test**: User can save note, delete it, and verify it's gone after refresh

### Implementation Tasks

- **SpecLedger-06k.9.1**: Add delete button to NoteSidebar items
  - **Component**: `ui`
  - **Requirements**: FR-016
  - **Acceptance**: Delete button (trash icon) appears next to each note, ARIA labels present

- **SpecLedger-06k.9.2**: Implement deleteNote action in Zustand store
  - **Component**: `core`
  - **Requirements**: FR-016
  - **Acceptance**: deleteNote removes note from array, updates LocalStorage, note gone from UI

- **SpecLedger-06k.9.3**: Implement empty state placeholder when no notes
  - **Component**: `ui`
  - **Requirements**: FR-016
  - **Acceptance**: "No saved notes yet" message shows when notes array empty, proper ARIA status

**Checkpoint**: User Story 7 complete - delete functionality works

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

**Feature Issue**: `SpecLedger-06k.10`
**Priority**: P2

### Tasks

- **SpecLedger-06k.10.1**: Create main page layout (app/page.tsx)
  - **Component**: `ui`
  - **Acceptance**: Page layout complete with microphone button centered, textarea below, sidebar visible

- **SpecLedger-06k.10.2**: Add responsive design for mobile devices
  - **Component**: `ui`
  - **Acceptance**: Layout works on mobile (sidebar stacks, button size appropriate, text readable)

- **SpecLedger-06k.10.3**: Implement error handling and user-friendly messages
  - **Component**: `core`
  - **Requirements**: FR-015
  - **Acceptance**: Permission denial shows helpful message, storage quota exceeded shows clear error, network issues handled gracefully

- **SpecLedger-06k.10.4**: Add accessibility enhancements (focus rings, ARIA, keyboard nav)
  - **Component**: `ui`
  - **Acceptance**: All interactive elements have visible focus, ARIA labels complete, keyboard navigation works throughout

- **SpecLedger-06k.10.5**: Performance optimization and code cleanup
  - **Component**: `core`
  - **Acceptance**: Page loads in <5s, speech-to-text delay <500ms, bundle <250KB gzipped, no console errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Extends US1, can work in parallel
- **User Story 3 (P1)**: Can start after Foundational - Independent of US1/US2 UI, shares store
- **User Story 4 (P2)**: Can start after Foundational - Independent, can proceed in parallel
- **User Story 5 (P2)**: Can start after Foundational - Independent language feature
- **User Story 6 (P3)**: Can start after Foundational - Independent detection logic
- **User Story 7 (P2)**: Can start after Foundational & US3 (needs NoteSidebar)

### Parallel Execution Opportunities

**After Foundational Phase Complete**:
- **Team A**: Work on US1 (MicrophoneButton, TextArea, speech integration)
- **Team B**: Work on US3 (NoteSidebar, save functionality)
- **Team C**: Work on US5 (LanguageSelector, language switching)
- **Team D**: Work on US6 (Browser detection, alert component)

All can proceed independently!

---

## MVP Scope

**Suggested MVP** = **User Stories 1 + 2 + 3** (Phases 3, 4, 5)

This delivers:
- ✅ Voice recording (US1)
- ✅ Stop recording (US2)
- ✅ Save notes (US3)

**MVP is independently testable** and delivers the core value proposition.

---

## Incremental Delivery Strategy

1. **Iteration 1 (MVP)**: User Stories 1, 2, 3 (P1)
   - Users can record, stop, and save notes
   - Fully functional application

2. **Iteration 2**: User Stories 4, 5, 7 (P2)
   - Add convenience features (clear, language, delete)
   - Improved UX

3. **Iteration 3**: User Story 6 + Polish (P3)
   - Browser compatibility warnings
   - Performance optimizations
   - Accessibility enhancements

---

## Beads Query Examples

```bash
# Show all P1 tasks (MVP)
bd list --label story:US1,story:US2,story:US3 --label spec:001-voice-dictation

# Show all P2 tasks (enhancements)
bd list --label story:US4,story:US5,story:US7 --label spec:001-voice-dictation

# Show all UI components
bd list --label component:ui --label spec:001-voice-dictation

# Show all core infrastructure
bd list --label component:core --label spec:001-voice-dictation

# Find ready tasks (no unresolved dependencies)
bd ready --label spec:001-voice-dictation

# Show task tree
bd dep tree --reverse SpecLedger-06k
```

---

> This file is intentionally light and index-only. Implementation data lives in Beads. Update this file only to point humans and agents to canonical query paths and feature references.

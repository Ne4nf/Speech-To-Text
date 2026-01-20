# Feature Specification: AI Meeting Synthesis Agent

**Feature Branch**: `002-ai-meeting-synthesis`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "Feature: AI Meeting Synthesis Agent (Phase 2). Description: Upgrade the existing Voice Dictation App to include an "Analyze & Synthesize" capability. 1. User Flow: User selects a saved note (Transcript), Clicks a new "Analyze with AI" button, System sends the text to an LLM (via Server Action), System displays a "Synthesis Result" card below the original text. 2. AI Logic: The AI must act as a "Technical Secretary", Input: Raw transcript (potentially messy, containing brainstorming), Processing: Ignore "brainstorming noise" (e.g., "maybe we could...", "I don't know..."), Extract Final Decisions only, Identify Architectural Changes (e.g., "Change DB from MySQL to Redis"), Output Format: A structured Markdown list of action items or spec updates. 3. Technical Constraints: Use Next.js Server Actions to securely call Anthropic API, Store the "AI Analysis" result locally alongside the original note in Zustand/LocalStorage, Requires an API Key configuration (env file). 4. UI Updates: Add "Analyze" button to the Note Sidebar or Toolbar, Add a visual distinction between "Raw Transcript" and "AI Summary"."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Context-Aware Transcript Analysis with Spec Update Suggestions (Priority: P1)

A user has saved a meeting transcript containing technical discussions and wants to extract and cross-reference decisions against their current project specification. They select a saved note, click "Analyze with AI", and the system processes BOTH the transcript AND the current spec file (e.g., specs/001-voice-dictation/spec.md) to identify decisions that should update the spec. The system cross-references the voice transcript with the spec to suggest specific "Spec Updates" (e.g., "In Section 3.1, change Database from MySQL to Redis").

**Why this priority**: This is the core functionality of the feature. Without context-aware analysis, users get generic decision lists that don't integrate with their project spec. This delivers immediate value by transforming voice notes into actionable spec update suggestions.

**Independent Test**: User can select a saved note with technical decisions, click "Analyze with AI", and receive specific spec update suggestions that reference actual sections in their spec file. Delivers value by saving time and improving accuracy.

**Acceptance Scenarios**:

1. **Given** the user has saved notes in the sidebar and has a project spec in specs/, **When** they click the "Analyze with AI" button on a note, **Then** the system displays a loading indicator and processes both the transcript and the spec file
2. **Given** the AI analysis is complete, **When** the results are displayed, **Then** the user sees structured spec update suggestions that reference specific sections and line numbers in their spec file (e.g., "In spec.md Section 3.1, add...")
3. **Given** the transcript contains a decision about Redis, **When** the AI processes it with the spec file, **Then** the AI identifies that the spec needs updating and suggests the specific change with section reference
4. **Given** the transcript contains no actionable decisions, **When** the AI processes it, **Then** the system indicates no spec updates needed or suggests "No clear decisions found in transcript"
5. **Given** the analysis result is generated, **When** the user views it, **Then** they can distinguish between the original raw transcript and the AI-generated spec update suggestions through visual styling

**Acceptance Scenarios**:

1. **Given** the user has saved notes in the sidebar, **When** they click the "Analyze with AI" button on a note, **Then** the system displays a loading indicator and processes the transcript
2. **Given** the AI analysis is complete, **When** the results are displayed, **Then** the user sees a structured list of final decisions and architectural changes with no brainstorming noise
3. **Given** a transcript contains tentative language ("maybe we could", "I think"), **When** the AI processes it, **Then** these statements are excluded from the final output
4. **Given** the AI identifies a decision, **When** the result is displayed, **Then** it appears as a clear, actionable item with proper categorization (Decision vs. Architectural Change)
5. **Given** the analysis result is generated, **When** the user views it, **Then** they can distinguish between the original raw transcript and the AI-generated summary through visual styling

---

### User Story 2 - Manage AI Analysis Results (Priority: P2)

A user wants to keep the AI analysis alongside their original transcript for reference. The system stores the analysis result locally so it persists across browser sessions, and users can re-analyze if they add more content to the transcript.

**Why this priority**: While analysis is valuable, persistence is an enhancement that improves the user experience. The core value is delivered in User Story 1; this makes it more convenient and reliable.

**Independent Test**: User can analyze a note, refresh the browser, and see the AI analysis still available alongside the original transcript. Can be tested by verifying persistence and re-analysis capability.

**Acceptance Scenarios**:

1. **Given** an AI analysis has been generated, **When** the user refreshes the browser, **Then** the analysis result remains visible alongside the original note
2. **Given** a user edits a note's transcript after analysis, **When** they click "Analyze with AI" again, **Then** the system re-analyzes the updated content and replaces the previous result
3. **Given** a note has an existing analysis, **When** the user deletes the note, **Then** both the transcript and the AI analysis are removed
4. **Given** multiple notes have been analyzed, **When** the user views the sidebar, **Then** each analyzed note displays a visual indicator showing it has an AI summary

---

### User Story 3 - Handle AI Service Errors (Priority: P2)

A user attempts to analyze a transcript but the AI service is unavailable or the API key is not configured. The system provides clear feedback about the issue and guidance on how to resolve it.

**Why this priority**: Error handling is important for user experience but doesn't block core functionality. Users can still use the voice dictation features without AI analysis.

**Independent Test**: User can test error scenarios by analyzing without an API key configured or with network connectivity issues. Delivers clear communication and recovery guidance.

**Acceptance Scenarios**:

1. **Given** no API key is configured, **When** the user clicks "Analyze with AI", **Then** the system displays a clear error message explaining the API key requirement
2. **Given** the AI service is temporarily unavailable, **When** analysis is attempted, **Then** the user sees a friendly error message with an option to retry
3. **Given** the transcript is too long for the AI to process, **When** analysis is attempted, **Then** the system informs the user of the character limit and suggests splitting the content
4. **Given** an analysis fails partway through, **When** the error occurs, **Then** the system releases the loading state and allows the user to try again

---

### User Story 4 - Configurable AI Analysis Prompts (Priority: P3)

A power user wants to customize how the AI analyzes their transcripts. They can choose between different analysis modes (e.g., "Technical Decisions Only", "Action Items & Owners", "Full Meeting Summary") to get outputs tailored to their needs.

**Why this priority**: This is an enhancement that improves flexibility but is not required for core functionality. The default "Technical Secretary" mode delivers value for most users.

**Independent Test**: Advanced users can select different analysis modes and receive appropriately formatted outputs. Can be tested by switching modes and verifying output format changes.

**Acceptance Scenarios**:

1. **Given** multiple analysis modes are available, **When** the user clicks "Analyze with AI", **Then** they can select their preferred mode before analysis begins
2. **Given** a user selects "Technical Decisions Only" mode, **When** the analysis completes, **Then** the output contains only architectural changes and technical decisions
3. **Given** a user selects "Action Items & Owners" mode, **When** the analysis completes, **Then** the output focuses on tasks and assignees mentioned in the transcript

---

### Edge Cases

- What happens when a transcript is empty or contains only silence/filler words?
- What happens when the current spec file (specs/001-voice-dictation/spec.md) doesn't exist or is empty?
- How does the system handle transcripts in languages other than English?
- What happens when a user tries to analyze a note while another analysis is in progress?
- How does the system handle extremely long transcripts (e.g., 2+ hour meetings)?
- What happens when the AI returns unparseable or malformed responses?
- How does the system handle transcripts with no clear decisions (pure brainstorming sessions)?
- What happens when a user's LocalStorage quota is exceeded after saving multiple analyses?
- How does the system handle rapid repeated clicks on the "Analyze" button?
- What happens when the AI service is rate-limited or times out?
- How does the system handle transcripts with mixed languages or code snippets?
- What happens when the spec file has conflicting decisions with the transcript?

## Requirements *(mandatory)*

### Functional Requirements

### Core Analysis Requirements

- **FR-001**: System MUST provide an "Analyze with AI" button on each saved note in the sidebar
- **FR-002**: System MUST send BOTH the selected note's transcript content AND the current spec file content to the AI service when analysis is triggered
- **FR-003**: System MUST display a loading indicator while the AI analysis is in progress
- **FR-004**: System MUST receive and display AI analysis results as structured Markdown content with specific spec update suggestions
- **FR-005**: System MUST filter out brainstorming noise (tentative language, exploratory phrases) from analysis results
- **FR-006**: System MUST identify and present final decisions separately from exploratory discussion
- **FR-007**: System MUST identify and highlight architectural changes mentioned in the transcript
- **FR-008**: System MUST cross-reference transcript decisions with current spec file to identify conflicts or needed updates
- **FR-009**: System MUST suggest specific "Spec Updates" that reference actual sections and line numbers from the spec file (e.g., "In spec.md Section 3.1, line 45: change Database from MySQL to Redis")
- **FR-010**: System MUST store AI analysis results alongside the original note in local storage
- **FR-011**: System MUST persist AI analysis results across browser sessions
- **FR-012**: System MUST allow re-analysis of notes when content changes
- **FR-013**: System MUST provide visual distinction between raw transcript and AI-generated summary
- **FR-014**: System MUST display clear error messages when AI service is unavailable
- **FR-015**: System MUST inform users when API key is not configured
- **FR-016**: System MUST handle analysis errors gracefully without breaking the application
- **FR-017**: System MUST validate transcript length before sending to AI service
- **FR-018**: System MUST prevent concurrent analysis of multiple notes by the same user
- **FR-019**: System MUST indicate which notes in the sidebar have AI analysis available
- **FR-020**: System MUST format AI analysis output as structured Markdown with clear sections (Decisions, Spec Updates, Action Items)
- **FR-021**: System MUST include timestamp showing when analysis was generated
- **FR-022**: System MUST allow users to dismiss or minimize the AI analysis view
- **FR-023**: System MUST read local markdown spec files from specs/ directory using Next.js Server Actions (server-side file system)
- **FR-024**: System MUST handle missing spec files gracefully (show error or degrade gracefully)
- **FR-025**: System MUST provide a "Paste" button that opens a modal dialog for pasting transcript content
- **FR-026**: System MUST validate pasted content (minimum 10 characters) before saving as a note
- **FR-027**: System MUST provide an "Upload" button that accepts .txt and .md transcript files
- **FR-028**: System MUST validate uploaded file size (maximum 1MB) and content (minimum 10 characters)
- **FR-029**: System MUST read uploaded file content using FileReader API and save as a note
- **FR-030**: System MUST display input buttons (Record, Paste, Upload) in a consistent, accessible layout
- **FR-031**: System MUST provide a language selector allowing users to choose between English (en-US) and Vietnamese (vi-VN)
- **FR-032**: System MUST apply selected language to voice recognition (Web Speech API lang attribute)
- **FR-033**: System MUST support Vietnamese speech recognition in compatible browsers (Chrome, Edge, Safari)
- **FR-034**: System MUST allow language switching before or during recording

### Key Entities

- **Note**: Represents a saved voice transcript with attributes for content, creation timestamp, language, and optional AI analysis result
- **AI Analysis**: Represents the structured output from the AI service, containing extracted decisions, architectural changes, and spec update suggestions, and metadata (timestamp, analysis mode, version)
- **SpecFile**: Represents the project specification file (e.g., specs/001-voice-dictation/spec.md) that provides context for analysis
- **Spec Update Suggestion**: A structured suggestion for updating a specific section of the spec file, including section reference, line number (if applicable), old content, and suggested new content
- **Analysis Result**: The structured Markdown content generated by the AI, categorized into sections (Decisions, Spec Updates, Action Items) with specific section references

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can extract actionable decisions from a 5-minute brainstorming transcript in under 10 seconds
- **SC-002**: AI analysis filters out at least 90% of brainstorming noise (tentative phrases, exploratory language) from results
- **SC-003**: 95% of users successfully identify all final decisions from a transcript without reading the raw content
- **SC-004**: Analysis results persist across browser refresh without requiring re-analysis
- **SC-005**: Users can distinguish between raw transcript and AI summary within 2 seconds of viewing
- **SC-006**: Error messages are clear and actionable, with 90% of users understanding what went wrong and how to fix it
- **SC-007**: AI analysis completes within 15 seconds for transcripts up to 2000 words
- **SC-008**: The system handles at least 50 analyzed notes without performance degradation

### Previous work

### Epic: SpecLedger-06k - Voice Dictation Interface (MVP)

**Status**: ✅ COMPLETE (Production-ready, all P1 user stories implemented)

**Delivered Features**:
- **User Story 1 - Start Voice Recording**: Implemented real-time speech-to-text using Web Speech API with browser-native voice recognition
- **User Story 2 - Stop Recording and Finalize Text**: Implemented stop recording functionality with transcript persistence
- **User Story 3 - Save Note to Sidebar**: Implemented note saving to LocalStorage with Zustand state management
- **User Story 7 - Delete Saved Note**: Implemented note deletion with empty state handling (bonus feature)

**Related Infrastructure**:
- **Components**: MicrophoneButton, TextArea, SaveNoteButton, NoteSidebar (all production-ready)
- **State Management**: Zustand store with persist middleware for LocalStorage
- **Speech Recognition**: Web Speech API wrapper (lib/speech.ts)
- **Data Model**: Note entity with content, createdAt, language, and optional analysis field
- **Storage**: LocalStorage via Zustand persist (key: 'voice-dictation-storage')

**Branch**: `001-voice-dictation`
**Current State**: MVP complete and deployed

**Constitutional Alignment**:
- Browser-Native First: Uses Web Speech API (no external services)
- Privacy by Design: All data stored locally, no telemetry or authentication
- Progressive Enhancement: Core MVP works without any AI features
- Simplicity & YAGNI: Minimal dependencies, direct API usage, flat structure
- Accessibility First: All components keyboard accessible, ARIA labels, WCAG AA compliant

**Integration with New Feature**:
- The AI analysis feature will extend the existing Note entity (analysis field already present in data model)
- All new UI components will integrate into existing layout (NoteSidebar extension)
- No breaking changes to existing voice dictation functionality
- AI features are opt-in (explicit "Analyze with AI" button) - users can ignore completely
- Analysis results stored alongside notes in existing LocalStorage (no new storage layer needed)

**Related Infrastructure**:
- **MicrophoneButton Component**: Handles voice recording with pulse animation and state management
- **TextArea Component**: Displays real-time transcript with ARIA live regions
- **SaveNoteButton Component**: Saves transcripts to Zustand store with LocalStorage persistence
- **NoteSidebar Component**: Displays saved notes list with delete functionality and empty states
- **Zustand Store (useStore)**: Manages notes array, recording state, and language preference with persist middleware
- **Web Speech API Wrapper**: Handles browser speech recognition with language switching support

**Constitution Compliance**:
- Browser-Native First: Core speech recognition remains browser-native; AI is opt-in enhancement
- Privacy by Design: AI features require explicit user trigger; analysis stored locally only
- Progressive Enhancement: Core voice dictation works without AI; analysis is enhancement layer
- Simplicity & YAGNI: AI processing uses Server Actions only when necessary (API key security)
- Accessibility First: AI analysis UI maintains keyboard navigation and ARIA labels

**Data Model Context**:
- Notes stored with structure: `{ id, content, createdAt, language, analysis? }`
- Analysis result extends note with: `{ analysis, analyzedAt, analysisMode }`
- LocalStorage key: `voice-dictation-storage` (persisted via Zustand)

**Technical Constraints from Constitution**:
- AI features MUST be opt-in with clear disclosure
- API key MUST be stored server-side (environment variables, never in client code)
- Server Actions MUST be used for all Anthropic API calls
- Clear UI indication when data will be sent to external service
- Graceful fallback if API key unavailable or feature disabled

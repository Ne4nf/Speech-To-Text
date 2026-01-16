<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 1.0.0 → 1.1.0
Rationale: MINOR version bump - Adding Anthropic API via Next.js Server Actions to Technology Standards for LLM transcript analysis capabilities. All existing principles preserved.

Modified Principles: None (all 5 principles unchanged)
Added Sections:
  - Technology Standards: Added Anthropic API via Next.js Server Actions
  - Technology Standards: Added Server Actions for secure API key handling

Removed Sections: None

Templates Status:
  ✅ constitution.md - Updated with new technology standard
  ✅ plan-template.md - Constitution check section verified (no changes needed)
  ⚠️ spec-template.md - Not reviewed (may need AI/LLM feature template updates)
  ✅ tasks-template.md - No changes needed (task structure unaffected)

Follow-up TODOs: None
================================================================================
-->

# Speech-to-Text Notes Constitution

## Core Principles

### I. Browser-Native First

The application MUST leverage browser-native APIs before external dependencies:
- **Web Speech API**: Primary speech recognition mechanism (no backend services)
- **LocalStorage/IndexedDB**: Primary data persistence (no server required)
- **Client-Side Processing**: All audio-to-text conversion happens in the browser

**Rationale**: Keeps the application free, private (no data leaves the device), and reduces infrastructure complexity and costs. Users get offline capability and zero latency from network calls.

### II. Progressive Enhancement

The application MUST function with minimal JavaScript and enhance from there:
- **Core MVP**: Speech recognition + note storage + basic display
- **Enhanced Experience**: Rich text editing, organization, search, AI-powered insights
- **Graceful Degradation**: Feature warnings for unsupported browsers (e.g., "Speech recognition not supported in this browser")

**Rationale**: Ensures broad compatibility and clear user communication. Users know immediately what features are available on their device.

### III. Privacy by Design

All user data MUST stay local by default:
- **No Backend Required**: Application is fully functional offline for core features
- **No Telemetry**: No user behavior tracking or analytics
- **No Account Required**: No authentication or personal data collection for core features
- **Local-Only Storage**: Notes stored only in browser storage by default
- **Optional Cloud Features**: AI features that require server processing MUST be opt-in with clear disclosure

**Rationale**: Speech notes can contain sensitive personal information. Keeping everything local respects user privacy and eliminates data breach risks. When server processing is needed (e.g., AI analysis), it MUST be explicitly disclosed and opt-in.

### IV. Simplicity & YAGNI

The application MUST avoid over-engineering:
- **Minimal Dependencies**: Only essential packages (Next.js, Tailwind, Zustand, Lucide, Anthropic SDK)
- **No Abstraction Layers**: Direct Web Speech API usage (no custom hooks unless reused 3+ times)
- **Flat Component Structure**: Avoid unnecessary component hierarchy
- **Clear Naming**: File and variable names must be self-explanatory
- **Server-Side Only When Necessary**: Use Next.js Server Actions for secure operations (API keys, heavy processing)

**Rationale**: Reduces maintenance burden, improves code readability, and makes the codebase approachable for contributors. Server-side code is reserved for operations that require security or computational resources not available in the browser.

### V. Accessibility First

All features MUST be accessible to users with disabilities:
- **Keyboard Navigation**: All speech controls must be keyboard-accessible
- **Screen Reader Support**: Proper ARIA labels on all interactive elements
- **Visual Feedback**: Clear indicators for recording state (listening, processing, error)
- **High Contrast**: Text must meet WCAG AA standards (4.5:1 for normal text)

**Rationale**: A speech-to-text application should be usable by everyone, including those who rely on assistive technology.

## Technology Standards

**Framework & Language**: Next.js 14 (App Router), TypeScript, React 18+
**Styling**: Tailwind CSS (utility-first, no CSS-in-JS)
**Icons**: Lucide React (tree-shakeable, consistent design)
**State Management**: Zustand (simple, minimal boilerplate)
**Speech Recognition**: Web Speech API via direct browser API
**AI/LLM Integration**: Anthropic API via Next.js Server Actions (secure server-side API key handling)
**Storage**: Browser LocalStorage (simple key-value) or IndexedDB (if large data)
**Testing**: Vitest + React Testing Library (if tests added)
**Linting**: ESLint with Next.js recommended config, Prettier for formatting
**Target Platform**: Modern browsers with Web Speech API support (Chrome, Edge, Safari)
**Performance**: <100ms time-to-interactive, <50ms state updates
**Bundle Size**: <250KB gzipped (excluding Next.js runtime)

### AI/LLM Integration Guidelines

**When to Use Server Actions**:
- API key security (NEVER expose Anthropic API key in client code)
- Heavy computation (LLM text analysis, summarization)
- Environment-specific features (development vs production)

**Implementation Pattern**:
- Use Next.js Server Actions (`app/actions/*.ts`) for all Anthropic API calls
- API key stored in environment variables (`ANTHROPIC_API_KEY`)
- Client components invoke Server Actions to trigger AI features
- Graceful fallback if API key unavailable or feature disabled

**Privacy Compliance**:
- AI features MUST be opt-in (user explicitly triggers analysis)
- Clear UI indication when data will be sent to external service
- Never send unsaved or involuntary data to external APIs

## Development Workflow

**Specification-First Development**:
- Features MUST start with a spec in `specs/[feature-name]/spec.md`
- Spec MUST include prioritized user stories (P1, P2, P3)
- Each user story MUST be independently testable
- Implementation MUST NOT begin until spec is reviewed and approved

**Code Quality Standards**:
- All TypeScript code MUST pass `npm run lint` with zero errors
- All code MUST be formatted with Prettier before commit
- Components MUST be functional (avoid classes unless necessary)
- File naming: `kebab-case` for files, `PascalCase` for components

**Git Workflow**:
- Branch naming: `[###-feature-name]` where ### is issue number
- Commit messages: Conventional Commits format (`feat:`, `fix:`, `docs:`, `refactor:`)
- PR reviews required for all changes
- Trunk-based development: short-lived branches (<2 days)

**Testing Approach** (when tests are added):
- Test user stories, not implementation details
- Focus on integration over unit tests
- Mock Web Speech API for tests (avoid real speech recognition in CI)
- Mock Anthropic API responses for AI feature tests

## Governance

**Constitution Authority**: This document supersedes all other practices. If a conflict arises between this constitution and external guidance (e.g., library documentation), the constitution takes precedence.

**Amendment Process**:
1. Proposed changes MUST be documented with rationale
2. Changes require explicit approval (file commit with amendment notes)
3. Version MUST be incremented according to semantic versioning:
   - MAJOR: Principle removal or backward-incompatible governance changes
   - MINOR: New principle added or existing principle materially expanded
   - PATCH: Clarifications, wording improvements, non-semantic changes
4. Amendment date MUST be updated in version footer

**Compliance Verification**:
- All pull requests MUST verify compliance with applicable principles
- Complexity violations MUST be justified in the plan's "Complexity Tracking" table
- Use `AGENTS.md` for runtime development guidance and agent instructions

**Issue Tracking**:
- Use Beads (via `bd` CLI) for feature and task management
- All user stories MUST link to Beads issues
- Dependencies between tasks MUST be explicit in the issue graph

**Version**: 1.1.0 | **Ratified**: 2026-01-15 | **Last Amended**: 2026-01-16

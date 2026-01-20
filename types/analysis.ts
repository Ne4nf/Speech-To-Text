/**
 * AI Analysis Types
 * Defines types for AI-powered transcript analysis
 */

/**
 * Analysis mode determines how the AI processes the transcript
 */
export type AnalysisMode = 'technical' | 'actions' | 'summary'

/**
 * AI analysis result attached to a note
 */
export interface NoteAnalysis {
  content: string // Markdown formatted analysis
  analyzedAt: number // Unix timestamp (ms)
  mode: AnalysisMode // Analysis type used
  version: number // Prompt version (for migrations)
}

/**
 * Internal structure for parsing AI responses (not stored)
 */
export interface AnalysisResult {
  decisions: Decision[]
  specUpdates: SpecUpdateSuggestion[] // Context-aware spec update suggestions
  filteredBrainstorming: string[]
  summary: string
  hasSpecContext: boolean // Whether spec file was provided
}

/**
 * Individual decision extracted from transcript
 */
export interface Decision {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  assignedTo?: string
  deadline?: string
  relatesToSpecSection?: string // Cross-reference to spec section
}

/**
 * Spec file metadata for context-aware analysis
 */
export interface SpecFile {
  path: string // Relative path from specs/ directory (e.g., "001-voice-dictation")
  fileName: string // File name (typically "spec.md")
  content: string // Full markdown content of spec file
  exists: boolean // True if file was successfully read
  lastModified?: number // Unix timestamp (ms) - optional, from fs.stat
}

/**
 * Suggestion for updating a specific section of the spec file
 */
export interface SpecUpdateSuggestion {
  sectionReference: string // Section identifier (e.g., "3.1" or "Architecture")
  lineNumber?: number // Specific line number if available
  sectionTitle: string // Human-readable section title
  currentContent: string // Current spec content (excerpt)
  suggestedContent: string // Proposed new content
  changeType: 'add' | 'modify' | 'remove' | 'replace'
  reason: string // Explanation from transcript analysis
  confidence: 'high' | 'medium' | 'low'
}

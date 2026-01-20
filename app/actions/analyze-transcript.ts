'use server'

import Anthropic from '@anthropic-ai/sdk'
import type { SpecFile, AnalysisMode } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Analyzes a transcript using Anthropic Claude API
 * Optionally includes spec file context for cross-referenced analysis
 * @param transcript - The meeting transcript to analyze
 * @param mode - Analysis mode (technical | actions | summary)
 * @param specFile - Optional spec file for context-aware analysis
 * @returns Markdown formatted analysis result
 * @throws Error if API key missing or transcript too long
 */
export async function analyzeTranscript(
  transcript: string,
  mode: AnalysisMode = 'technical',
  specFile?: SpecFile | null
): Promise<{ markdown: string; success: boolean }> {
  // Validate API key
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }

  // Validate transcript length
  const wordCount = transcript.split(/\s+/).length
  if (wordCount > 2000) {
    throw new Error(`Transcript too long (${wordCount} words). Maximum 2000 words.`)
  }

  // Build system prompt based on mode and spec context
  const systemPrompt = getSystemPrompt(mode, specFile)

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: specFile?.exists
            ? `Analyze this transcript with the following project specification as context:\n\n${specFile.content}\n\n---\n\nTranscript to analyze:\n\n${transcript}`
            : `Analyze this transcript and extract final decisions:\n\n${transcript}`,
        },
      ],
    })

    // Extract and validate response
    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    return { markdown: content, success: true }
  } catch (error: any) {
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please wait and try again.')
    }
    if (error.status === 401) {
      throw new Error('Invalid API key. Please check ANTHROPIC_API_KEY.')
    }
    throw new Error(error.message || 'Analysis failed')
  }
}

/**
 * Generates system prompt based on analysis mode and spec context
 */
function getSystemPrompt(mode: AnalysisMode, specFile?: SpecFile | null): string {
  // Enhanced prompt for context-aware analysis
  if (specFile?.exists) {
    return `You are an expert meeting analyst with access to the project specification.
Your task is to:
1. Analyze the meeting transcript
2. Cross-reference decisions with the provided specification
3. Identify conflicts or updates needed in the specification
4. Suggest specific spec updates with section references (e.g., "In Section 3.1, change Database from MySQL to Redis")

Output Format (in Markdown):
## Spec Updates
For each spec update needed:
### Section X.X: Section Title (Line Y)
**Change**: [Add/Modify/Remove/Replace]
**Confidence**: [High/Medium/Low]
**Current**: "[current content excerpt]"
**Suggested**: "[suggested new content]"
**Reason**: "[explanation from transcript]"

## Decisions
- [PRIORITY] Decision title (Relates to Section X if applicable)
  - Description

## Action Items
- [Owner] Task description (if mentioned)

Focus on technical decisions and architectural changes when mode is 'technical'.
Focus on action items, assignments, and deadlines when mode is 'actions'.
Provide comprehensive meeting summary when mode is 'summary'.`
  }

  // Original prompt for non-context-aware analysis
  const basePrompt = `You are an expert meeting analyst. Extract final decisions from transcripts while filtering out brainstorming content.

Rules:
- Ignore tentative language ("maybe we could", "I think", "what if")
- Only extract final, agreed-upon decisions
- Identify architectural changes and technical decisions
- Filter out exploratory discussion

Output Format (in Markdown):`

  const modeInstructions: Record<AnalysisMode, string> = {
    technical: 'Focus on technical decisions and architectural changes.',
    actions: 'Focus on action items, assignments, and deadlines.',
    summary: 'Provide a comprehensive meeting summary.',
  }

  return `${basePrompt}

## Decisions
- [PRIORITY] Decision title
  - Description

## Architectural Changes
- Change description
  - Impact and rationale

${modeInstructions[mode]}

${mode === 'technical' ? '## Action Items (if any)\n- [Owner] Task description' : ''}`
}

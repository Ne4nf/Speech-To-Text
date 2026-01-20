'use server'

import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import type { SpecFile } from '@/types'

/**
 * Reads a local markdown spec file from the specs/ directory
 * @param specPath - Relative path within specs/ directory (e.g., "001-voice-dictation")
 * @returns SpecFile object with content, exists flag, and metadata
 * @throws Error if path contains directory traversal attempts
 */
export async function readSpecFile(specPath: string): Promise<SpecFile> {
  // Security: Validate path (prevent directory traversal)
  if (specPath.includes('..') || specPath.startsWith('/') || specPath.startsWith('\\')) {
    throw new Error('Invalid spec path: path traversal not allowed')
  }

  try {
    const fullPath = join(process.cwd(), 'specs', specPath, 'spec.md')
    const content = await readFile(fullPath, 'utf-8')
    const stats = await stat(fullPath)

    return {
      path: specPath,
      fileName: 'spec.md',
      content,
      exists: true,
      lastModified: stats.mtimeMs,
    }
  } catch (error) {
    // Graceful degradation: return exists: false
    console.error('Failed to read spec file:', error)
    return {
      path: specPath,
      fileName: 'spec.md',
      content: '',
      exists: false,
    }
  }
}

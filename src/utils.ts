import * as core from '@actions/core'
import * as crypto from 'node:crypto'

import { ActionInputsSchema, ActionInputs } from './schema'

/**
 * Extracts the title from an HTML string.
 *
 * @param html - The HTML string to extract the title from.
 * @returns {string | null} The extracted title or null if no title is found.
 */
export function extractTitleFromHtml(html: string): string | null {
  const titleMatch = /<title>(.*?)<\/title>/i.exec(html)
  if (titleMatch && titleMatch.length >= 2) {
    return titleMatch[1]
  }

  return null
}

/**
 * Extracts the description from HTML by searching for the meta tag with name="description".
 *
 * @param html - The HTML string to extract the description from.
 * @returns The extracted description or null if not found.
 */
export function extractDescriptionFromHtml(html: string): string | null {
  const match = /<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/i.exec(html)
  if (match && match.length >= 2) {
    return match[1]
  }

  return null
}

/**
 * Extracts the keywords/tags from HTML by searching for the meta tag with name="keywords".
 *
 * @param html - The HTML string to extract keywords from.
 * @returns An array of keywords extracted from the HTML metadata, or null if no keywords are found.
 */
export function extractKeywordsFromHtml(html: string): string[] | null {
  const match = /<meta\s+name="keywords"\s+content="([^"]*)"\s*\/?>/i.exec(html)
  if (match && match.length >= 2) {
    const keywordsString = match[1]
    return keywordsString.split(',').map((keyword) => keyword.trim())
  }

  return null
}

/**
 * Gets the inputs for the action.
 * @returns {ActionInputs} The inputs for the action.
 */
export function getActionInputs(): ActionInputs {
  const accessToken: string = core.getInput('access-token')
  const openaiApiKey: string = core.getInput('openai-api-key')
  const publicationId: string = core.getInput('publication-id')
  const ignoreDrafts: boolean = core.getBooleanInput('ignore-drafts')
  const rawSupportedFormats: string = core.getInput('supported-formats')
  const postsDirectory: string = core.toPlatformPath(core.getInput('posts-directory'))

  return ActionInputsSchema.parse({
    supportedFormats: rawSupportedFormats,
    postsDirectory,
    publicationId,
    openaiApiKey,
    ignoreDrafts,
    accessToken
  })
}

export function computeContentHash(content: string): string {
  const hash = crypto.createHash('sha256')
  hash.update(content)

  return hash.digest('hex')
}

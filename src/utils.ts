import TurndownService from 'turndown'
import * as core from '@actions/core'
import * as crypto from 'node:crypto'
import slugify from 'slugify'

import { ActionInputsSchema, ActionInputs } from './schema'

/**
 * Extracts the title from an HTML string.
 *
 * @param html - The HTML string to extract the title from.
 * @returns The extracted title or null if no title is found.
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
 * @returns The inputs for the action.
 */
export function getActionInputs(): ActionInputs {
  const accessToken: string = core.getInput('access-token')
  const openaiApiKey: string = core.getInput('openai-api-key')
  const publicationId: string = core.getInput('publication-id')
  const rawSupportedFormats: string = core.getInput('supported-formats')
  const postsDirectory: string = core.toPlatformPath(core.getInput('posts-directory'))

  return ActionInputsSchema.parse({
    supportedFormats: rawSupportedFormats,
    postsDirectory,
    publicationId,
    openaiApiKey,
    accessToken
  })
}

/**
 * Computes the SHA256 hash of the given content.
 *
 * @param content - The content to compute the hash for.
 * @returns The computed hash as a hexadecimal string.
 */
export function computeContentHash(content: string): string {
  const hash = crypto.createHash('sha256')
  hash.update(content)

  return hash.digest('hex')
}

/**
 * Converts a given text into a slug by removing special characters and converting to lowercase.
 * @param text - The text to be slugified.
 * @returns The slugified version of the text.
 */
export function slugifyText(text: string): string {
  return slugify(text, { strict: true, lower: true })
}

export function initTurndownService(): TurndownService {
  const turndownService = new TurndownService()
  turndownService.remove('title') // Remove title from HTML output.

  return turndownService
}

// Utility function to log messages
export function log(message: string): void {
  core.info(message)
}

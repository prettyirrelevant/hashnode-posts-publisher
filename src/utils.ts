import TurndownService from 'turndown'
import * as core from '@actions/core'
import * as crypto from 'node:crypto'
import Replicate from 'replicate'

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
  const replicateApiKey: string = core.getInput('replicate-api-key')
  const publicationId: string = core.getInput('publication-id')
  const rawSupportedFormats: string = core.getInput('supported-formats')
  const postsDirectory: string = core.toPlatformPath(core.getInput('posts-directory'))

  return ActionInputsSchema.parse({
    supportedFormats: rawSupportedFormats,
    replicateApiKey,
    postsDirectory,
    publicationId,
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
 * This was ported from https://github.com/django/django/blob/f71bcc001bb3324020cfd756e84d4e9c6bb98cce/django/utils/text.py#L436
 *
 * @param text - The text to be slugified.
 * @returns The slugified version of the text.
 */
export function slugifyText(text: string): string {
  return (
    text
      // eslint-disable-next-line no-control-regex
      .replace(/[^\u0000-\u007F]/, '')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[-\s]+/g, '-')
      .replace(/^-+|-+$/g, '')
  )
}

/**
 * Initializes a TurndownService instance.
 * The TurndownService is used to convert HTML to Markdown.
 * The 'title' element is removed from the HTML output.
 *
 * @returns {TurndownService} The initialized TurndownService instance.
 */
export function initTurndownService(): TurndownService {
  const turndownService = new TurndownService()
  turndownService.remove('title') // Remove title from HTML output.

  return turndownService
}

/**
 * Logs a message to the console.
 * @param message - The message to be logged.
 */
export function log(message: string): void {
  core.info(`[info]: ${message}`)
}

/**
 * Initializes a Replicate instance with an optional API key.
 * If no API key is provided, a default API key will be used.
 *
 * @param apiKey - Optional API key for authentication.
 * @returns A new Replicate instance.
 */
export function initReplicateService(apiKey?: string): Replicate {
  return new Replicate({
    auth: apiKey || 'r8_P1YGRTYClMSWLarwf4NFk07y7rsQC2d2fYhDr'
  })
}

import * as core from '@actions/core'

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

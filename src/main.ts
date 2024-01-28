import TurndownService from 'turndown'
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as path from 'node:path'
import * as fs from 'node:fs'
import fm from 'front-matter'

import {
  extractDescriptionFromHtml,
  extractKeywordsFromHtml,
  extractTitleFromHtml,
  computeContentHash,
  getActionInputs,
  slugifyText
} from './utils'
import { PostAttributes, PostSchema, Post } from './schema'
import { HashnodeAPI } from './services'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const inputs = getActionInputs()
    const excludePatterns = ['README.md', 'LICENSE.md', 'CONTRIBUTING.md'].map((file) =>
      core.toPlatformPath(`!${inputs.postsDirectory}/${file}`)
    )
    const patterns = [
      ...excludePatterns,
      ...inputs.supportedFormats.map((format) => core.toPlatformPath(`${inputs.postsDirectory}/**/*.${format}`))
    ]

    const posts: Post[] = []
    const turndownService = new TurndownService()

    // TODO: fetch lockfile for repository and ignore posts that have not changed.

    const globber = await glob.create(patterns.join('\n'))
    for await (const file of globber.globGenerator()) {
      console.log(`File: ${file}`)

      if (file.endsWith('.html')) {
        const htmlContent = fs.readFileSync(file, { encoding: 'utf8' })
        const markdownContent = turndownService.turndown(htmlContent)
        const title = extractTitleFromHtml(htmlContent) || path.parse(file).name
        const tags = extractKeywordsFromHtml(htmlContent) || ['hashnode']

        posts.push(
          PostSchema.parse({
            attributes: {
              description: extractDescriptionFromHtml(htmlContent),
              draft: true,
              title,
              tags
            },
            hash: computeContentHash(htmlContent),
            content: markdownContent,
            slug: slugifyText(title)
          })
        )
      } else if (file.endsWith('.md')) {
        const markdownContent = fs.readFileSync(file, { encoding: 'utf8' })
        const formattedMarkdown = fm<PostAttributes>(markdownContent)
        if (formattedMarkdown.attributes.draft && inputs.ignoreDrafts) {
          continue
        }

        posts.push(
          PostSchema.parse({
            slug: slugifyText(formattedMarkdown.attributes.title),
            hash: computeContentHash(markdownContent),
            attributes: formattedMarkdown.attributes,
            content: formattedMarkdown.body
          })
        )
      }
    }
    console.log(`Found ${posts.length} posts.`)

    // TODO: handle audio files.
    // TODO: generate lockfile to avoid duplicate posts.
    const hashnodeApiClient = new HashnodeAPI(inputs.accessToken, inputs.publicationId)
    const results = await Promise.allSettled(
      posts.map(async (post) =>
        // post.attributes.draft ? hashnodeApiClient.uploadDraft(post) : hashnodeApiClient.uploadPost(post)
        hashnodeApiClient.uploadPost(post)
      )
    )
    console.log(`Finished uploading ${results.length} posts.`)

    // TODO: write successful results to lockfile

    results.map((result) =>
      result.status === 'fulfilled'
        ? console.log(result.status, result.value.data)
        : console.log(result.status, result.reason)
    )
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

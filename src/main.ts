import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as path from 'node:path'
import * as fs from 'node:fs'
import fm from 'front-matter'

import {
  extractDescriptionFromHtml,
  extractKeywordsFromHtml,
  extractTitleFromHtml,
  initTurndownService,
  computeContentHash,
  getActionInputs,
  slugifyText
} from './utils'
import { UploadPostSuccessResponse, PostAttributes, PostSchema, Post } from './schema'
import { HashnodeAPI, LockfileAPI } from './services'

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
    const turndownService = initTurndownService()
    const hashnodeApiClient = new HashnodeAPI(inputs.accessToken, inputs.publicationId)
    const lockfileApiClient = new LockfileAPI(process.env.GITHUB_REPOSITORY_ID as string)

    const globber = await glob.create(patterns.join('\n'))
    const lockfile = await lockfileApiClient.retrieveLockfile()
    for await (const file of globber.globGenerator()) {
      console.log(`File: ${file}`)

      if (file.endsWith('.html')) {
        const htmlContent = fs.readFileSync(file, { encoding: 'utf8' })
        const markdownContent = turndownService.turndown(htmlContent)
        const title = extractTitleFromHtml(htmlContent) || path.parse(file).name
        const tags = extractKeywordsFromHtml(htmlContent) || ['hashnode']
        const hash = computeContentHash(htmlContent)

        if (lockfile?.data.content.find((content) => content.path === file && content.hash === hash)) {
          console.log(`Skipping ${file} because it has not changed.`)
          continue
        }

        posts.push(
          PostSchema.parse({
            attributes: {
              description: extractDescriptionFromHtml(htmlContent),
              draft: true,
              title,
              tags
            },
            content: markdownContent,
            slug: slugifyText(title),
            path: file,
            hash
          })
        )
      } else if (file.endsWith('.md')) {
        const markdownContent = fs.readFileSync(file, { encoding: 'utf8' })
        const formattedMarkdown = fm<PostAttributes>(markdownContent)
        const hash = computeContentHash(markdownContent)
        if (formattedMarkdown.attributes.draft) {
          continue
        }

        if (lockfile?.data.content.find((content) => content.path === file && content.hash === hash)) {
          console.log(`Skipping ${file} because it has not changed.`)
          continue
        }

        posts.push(
          PostSchema.parse({
            slug: slugifyText(formattedMarkdown.attributes.title),
            attributes: formattedMarkdown.attributes,
            content: formattedMarkdown.body,
            path: file,
            hash
          })
        )
      }
    }

    // TODO: handle audio files.

    // this can be made more efficient but it's fine for now -- i guess.
    const results = await Promise.allSettled(
      posts.map(async (post) =>
        lockfile?.data.content.find((content) => content.path === post.path && content.hash !== post.hash)
          ? hashnodeApiClient.updatePost(
              post,
              lockfile?.data.content.find((content) => content.path === post.path && content.hash !== post.hash)
                ?.id as string
            )
          : hashnodeApiClient.uploadPost(post)
      )
    )

    const successfulResults = results.filter(
      (result) => result.status === 'fulfilled'
    ) as PromiseFulfilledResult<UploadPostSuccessResponse>[]

    await lockfileApiClient.updateLockfile(
      posts,
      successfulResults.map((result) => result.value),
      lockfile?.data
    )
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

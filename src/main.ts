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
  slugifyText,
  log
} from './utils'
import { PostSuccessResponse, PostAttributes, PostSchema, Post } from './schema'
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

    const lockfile = await lockfileApiClient.retrieveLockfile()
    const globber = await glob.create(patterns.join('\n'))
    for await (const file of globber.globGenerator()) {
      if (file.endsWith('.html') && inputs.supportedFormats.includes('html')) {
        log(`Processing file ${file}`)

        const htmlContent = fs.readFileSync(file, { encoding: 'utf8' })
        const markdownContent = turndownService.turndown(htmlContent)
        const title = extractTitleFromHtml(htmlContent) || path.parse(file).name
        const tags = extractKeywordsFromHtml(htmlContent) || ['hashnode']
        const hash = computeContentHash(htmlContent)
        // we use the name of the file (with the extension) as the path to
        // avoid post duplication when the repository name is changed.
        const fileName = path.parse(file).base

        if (lockfile.data?.content.find((content) => content.path === fileName && content.hash === hash)) {
          log(`Skipping ${file} because it has not changed.`)
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
            path: fileName,
            hash
          })
        )
      } else if (file.endsWith('.md') && inputs.supportedFormats.includes('md')) {
        log(`Processing file ${file}`)
        const markdownContent = fs.readFileSync(file, { encoding: 'utf8' })
        const formattedMarkdown = fm<PostAttributes>(markdownContent)
        const hash = computeContentHash(markdownContent)
        // we use the name of the file (with the extension) as the path to
        // avoid post duplication when the repository name is changed.
        const fileName = path.parse(file).base

        if (formattedMarkdown.attributes.draft) {
          log(`Skipping ${file} because it is a draft.`)
          continue
        }

        if (lockfile.data?.content.find((content) => content.path === fileName && content.hash === hash)) {
          log(`Skipping ${file} because it has not changed.`)
          continue
        }

        posts.push(
          PostSchema.parse({
            slug: slugifyText(formattedMarkdown.attributes.title),
            attributes: formattedMarkdown.attributes,
            content: formattedMarkdown.body,
            path: fileName,
            hash
          })
        )
      }
    }

    // TODO: handle audio files.

    if (posts.length === 0) {
      log('No posts to publish.')
      return
    }

    log(`Found ${posts.length} posts to publish.`)
    const results: PromiseSettledResult<unknown>[] = await Promise.allSettled(
      posts.map(async (post) => {
        const existingContent = lockfile.data?.content.find(
          (content) => content.path === post.path && content.hash !== post.hash
        )
        if (existingContent) {
          return await hashnodeApiClient.updatePost(post, existingContent.id)
        } else {
          return await hashnodeApiClient.uploadPost(post)
        }
      })
    )

    const failedResults = results.filter((result) => result.status === 'rejected') as PromiseRejectedResult[]
    log(`Failed to publish ${failedResults.length} posts.`)
    for (const result of failedResults) {
      log(result.reason)
    }

    const successfulResults = results.filter(
      (result) => result.status === 'fulfilled'
    ) as PromiseFulfilledResult<PostSuccessResponse>[]

    log(`Published ${successfulResults.length} posts.`)

    await lockfileApiClient.updateLockfile({
      successfulUploads: successfulResults.map((result) => result.value),
      currentLockfile: lockfile?.data
    })

    log('Action completed successfully.')
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

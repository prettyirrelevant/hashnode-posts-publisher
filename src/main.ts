import TurndownService from 'turndown'
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as path from 'node:path'
import * as fs from 'node:fs'
import fm from 'front-matter'

interface PostAttributes {
  description?: string
  draft: boolean
  title: string
}

interface Post {
  attributes: PostAttributes
  content: string
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const postsDirectory: string = core.toPlatformPath(core.getInput('posts-directory'))
    const ignoreDrafts: boolean = core.getBooleanInput('ignore-drafts')

    const supportedFormats: string[] = core.getInput('supported-formats').split(',')
    const isAudioSupported = supportedFormats.includes('audio') ? true : false

    core.debug(
      `Got inputs: ignoreDrafts=${ignoreDrafts} postsDirectory=${postsDirectory} supportedFormats=${supportedFormats}`
    )

    const excludePatterns = ['README.md', 'LICENSE.md', 'CONTRIBUTING.md'].map(file =>
      core.toPlatformPath(`${postsDirectory}/${file}`)
    )
    const patterns = [
      ...excludePatterns,
      ...supportedFormats.map(format => core.toPlatformPath(`${postsDirectory}/**/*.${format}`))
    ]
    const globber = await glob.create(patterns.join('\n'))

    // turndown
    const turndownService = new TurndownService()
    const posts: Post[] = []

    for await (const file of globber.globGenerator()) {
      console.log(`File: ${file}`)

      if (file.endsWith('.html')) {
        const htmlContent = fs.readFileSync(file, { encoding: 'utf8' })
        const markdownContent = turndownService.turndown(htmlContent)
        posts.push({
          attributes: { title: extractTitleFromHtml(htmlContent) || path.parse(file).name, draft: true },
          content: markdownContent
        })
      } else if (file.endsWith('.md')) {
        const markdownContent = fs.readFileSync(file, { encoding: 'utf8' })
        const formattedMarkdown = fm<PostAttributes>(markdownContent)
        if (formattedMarkdown.attributes.draft && ignoreDrafts) {
          continue
        }
        posts.push({ attributes: formattedMarkdown.attributes, content: formattedMarkdown.body })
      }
    }

    console.log(`Found ${posts.length} posts:\n${JSON.stringify(posts, null, 2)}`)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function extractTitleFromHtml(html: string): string | null {
  const titleMatch = /<title>(.*?)<\/title>/i.exec(html)
  if (titleMatch && titleMatch.length >= 2) {
    return titleMatch[1]
  }

  return null
}

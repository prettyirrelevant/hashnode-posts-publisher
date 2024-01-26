import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as path from 'node:path'
import fm from 'front-matter'
import TurndownService from 'turndown'
import turndownPluginGfm from 'turndown-plugin-gfm'
import * as fs from 'node:fs'

interface PostAttributes {
  title: string
  draft: boolean
  description?: string
}

interface Post {
  content: string
  attributes: PostAttributes
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
    turndownService.use(turndownPluginGfm.gfm)

    const posts: Post[] = []
    for await (const file of globber.globGenerator()) {
      console.log(`File: ${file}`)

      if (file.endsWith('.html')) {
        const htmlContent = fs.readFileSync(file, { encoding: 'utf8' })
        const markdownContent = turndownService.turndown(htmlContent)
        posts.push({
          content: markdownContent,
          attributes: { title: extractTitleFromHtml(htmlContent) || path.parse(file).name, draft: true }
        })
      } else if (file.endsWith('.md')) {
        const markdownContent = fs.readFileSync(file, { encoding: 'utf8' })
        const formattedMarkdown = fm<PostAttributes>(markdownContent)
        if (formattedMarkdown.attributes.draft && ignoreDrafts) {
          continue
        }
        posts.push({ content: formattedMarkdown.body, attributes: formattedMarkdown.attributes })
      }
    }
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

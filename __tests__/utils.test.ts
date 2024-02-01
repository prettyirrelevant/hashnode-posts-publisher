import * as core from '@actions/core'

import {
  extractDescriptionFromHtml,
  extractKeywordsFromHtml,
  extractTitleFromHtml,
  computeContentHash,
  getActionInputs,
  slugifyText,
  log
} from '../src/utils'

let infoMock: jest.SpyInstance
let getInputMock: jest.SpyInstance

describe('utils', () => {
  describe('extractTitleFromHtml()', () => {
    it('returns the title when it is present', () => {
      const html = '<title>My title</title>'
      const title = extractTitleFromHtml(html)
      expect(title).toBe('My title')
    })

    it('returns null when the title is not present', () => {
      const html = '<h1>My title</h1>'
      const title = extractTitleFromHtml(html)
      expect(title).toBeNull()
    })
  })

  describe('extractDescriptionFromHtml()', () => {
    it('returns the description when it is present', () => {
      const html = '<meta name="description" content="My description"/>'
      const description = extractDescriptionFromHtml(html)
      expect(description).toBe('My description')
    })

    it('returns null when the description is not present', () => {
      const html = '<h1>My title</h1>'
      const description = extractDescriptionFromHtml(html)
      expect(description).toBeNull()
    })
  })

  describe('extractKeywordsFromHtml()', () => {
    it('returns the keywords when it is present', () => {
      const html = '<meta name="keywords" content="test,jest,brest"/>'
      const keywords = extractKeywordsFromHtml(html)
      expect(keywords).toStrictEqual(['test', 'jest', 'brest'])
    })

    it('returns null when the keywords is not present', () => {
      const html = '<h1>My title</h1>'
      const keywords = extractKeywordsFromHtml(html)
      expect(keywords).toBeNull()
    })
  })

  describe('computeContentHash()', () => {
    it('returns the hash of the content', () => {
      const content = 'My content'
      const hash = computeContentHash(content)
      expect(hash).toBe('332193bd6fb3d1a7c7caa91c4c5c10d7ae2fa751762e625de19e765066c8b6f2')
    })
  })

  describe('slugifyText()', () => {
    it('returns the slugified text', () => {
      const text = 'My text'
      const slug = slugifyText(text)
      expect(slug).toBe('my-text')
    })

    it('returns the slugified text with special characters', () => {
      const text = 'My text with $peci@l ch@r@cter$'
      const slug = slugifyText(text)
      expect(slug).toBe('my-text-with-pecil-chrcter')
    })
  })

  describe('log()', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      infoMock = jest.spyOn(core, 'info').mockImplementation()
    })

    it('logs a message', () => {
      log('i am running a test')
      expect(infoMock).toHaveBeenCalledWith('[info]: i am running a test')
    })
  })

  describe('getActionInputs()', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    })

    it('required inputs are set', () => {
      getInputMock.mockImplementation((name: string): string => {
        switch (name) {
          case 'posts-directory':
            return 'posts/'
          case 'supported-formats':
            return 'md'
          case 'publication-id':
            return 'dy-dx'
          case 'access-token':
            return '123'
          default:
            return ''
        }
      })

      const inputs = getActionInputs()
      expect(inputs.accessToken).toBe('123')
      expect(inputs.publicationId).toBe('dy-dx')
      expect(inputs.postsDirectory).toBe('posts/')
      expect(inputs.supportedFormats).toStrictEqual(['md'])
    })
  })
})

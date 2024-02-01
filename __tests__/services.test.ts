import { LockfileAPI, HashnodeAPI } from '../src/services'

describe('HashnodeAPI', () => {
  let hashnodeAPI: HashnodeAPI

  beforeEach(() => {
    hashnodeAPI = new HashnodeAPI('mockAccessToken', 'mockPublicationId')
  })

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      hashnodeAPI.client.post = jest.fn().mockResolvedValueOnce({
        data: {
          data: {
            updatePost: {
              post: {
                id: 'mockPostId',
                url: 'https://example.com/mock-post',
                slug: 'mock-post-slug'
              }
            }
          }
        }
      })

      const post = {
        attributes: {
          coverImageUrl: 'https://example.com/mock-cover-image',
          tags: [{ name: 'mock', slug: 'mock' }],
          title: 'Mock Post',
          draft: false
        },
        content: 'This is a mock post content',
        path: '/mock-post-path',
        slug: 'mock-post-slug',
        hash: 'mock-post-hash'
      }

      const result = await hashnodeAPI.updatePost(post, 'mockPostId')
      expect(result).toEqual({
        data: {
          updatePost: {
            post: {
              id: 'mockPostId',
              url: 'https://example.com/mock-post',
              path: '/mock-post-path',
              slug: 'mock-post-slug',
              hash: 'mock-post-hash'
            }
          }
        }
      })
    })

    it('should handle errors during post update', async () => {
      hashnodeAPI.client.post = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            errors: ['Error occurred during post update']
          }
        }
      })

      const post = {
        attributes: {
          tags: [{ name: 'mock', slug: 'mock' }],
          title: 'Mock Post',
          draft: false
        },
        content: 'This is a mock post content',
        path: '/mock-post-path',
        slug: 'mock-post-slug',
        hash: 'mock-post-hash'
      }

      await expect(hashnodeAPI.updatePost(post, 'mockPostId')).rejects.toThrow('["Error occurred during post update"]')
    })
  })

  describe('uploadPost', () => {
    it('should upload a post successfully', async () => {
      hashnodeAPI.client.post = jest.fn().mockResolvedValueOnce({
        data: {
          data: {
            publishPost: {
              post: {
                id: 'mockPostId',
                url: 'https://example.com/mock-post',
                slug: 'mock-post-slug'
              }
            }
          }
        }
      })

      const post = {
        attributes: {
          coverImageUrl: 'https://example.com/mock-cover-image',
          tags: [{ name: 'mock', slug: 'mock' }],
          title: 'Mock Post',
          draft: false
        },
        content: 'This is a mock post content',
        path: '/mock-post-path',
        slug: 'mock-post-slug',
        hash: 'mock-post-hash'
      }

      const result = await hashnodeAPI.uploadPost(post)
      expect(result).toEqual({
        data: {
          publishPost: {
            post: {
              id: 'mockPostId',
              url: 'https://example.com/mock-post',
              path: '/mock-post-path',
              slug: 'mock-post-slug',
              hash: 'mock-post-hash'
            }
          }
        }
      })
    })

    it('should handle errors during post upload', async () => {
      hashnodeAPI.client.post = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            errors: ['Error occurred during post upload']
          }
        }
      })

      const post = {
        attributes: {
          tags: [{ name: 'mock', slug: 'mock' }],
          title: 'Mock Post',
          draft: false
        },
        content: 'This is a mock post content',
        path: '/mock-post-path',
        slug: 'mock-post-slug',
        hash: 'mock-post-hash'
      }
      await expect(hashnodeAPI.uploadPost(post)).rejects.toThrow('["Error occurred during post upload"]')
    })
  })
})

describe('LockfileAPI', () => {
  let lockfileApi: LockfileAPI

  beforeEach(() => {
    lockfileApi = new LockfileAPI('demo-repo')
  })

  it('updates lockfile correctly', async () => {
    lockfileApi.client.put = jest.fn().mockResolvedValueOnce({
      data: {
        data: 'lockfile updated successfully'
      }
    })
    const successfulUploads = [
      { data: { updatePost: { post: { id: '1', slug: 'slug-1', path: 'p1', hash: 'h1', url: 'u1' } } } },
      { data: { updatePost: { post: { id: '1', slug: 'slug-1', path: 'p1', hash: 'h1', url: 'u1' } } } },
      { data: { updatePost: { post: { id: '1', slug: 'slug-1', path: 'p1', hash: 'h1', url: 'u1' } } } }
    ]
    const currentLockfile = undefined

    const response = await lockfileApi.updateLockfile({ successfulUploads, currentLockfile })
    expect(response).toEqual({ data: 'lockfile updated successfully' })
  })

  it('retrieves lockfile correctly', async () => {
    const response = await lockfileApi.retrieveLockfile()
    expect(response.data).toBeNull()
  })
})

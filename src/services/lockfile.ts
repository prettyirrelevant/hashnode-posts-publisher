import axios, { isAxiosError } from 'axios'

import { UploadPostSuccessResponse, Post } from '../schema'

interface UpdateLockfileResponse {
  data: string
}

interface RetrieveLockfileResponse {
  data?: Lockfile
}

interface Lockfile {
  content: LockfileContent[]
  repositoryName: string
  repositoryId: string
  createdAt: string
  updatedAt: string
  id: string
}

interface LockfileContent {
  hash: string
  path: string
  url: string
  id: string
}

export class LockfileAPI {
  private baseUrl = 'https://salty-inlet-70255-aa12f0db37c0.herokuapp.com'
  private client: axios.AxiosInstance
  private repositoryId: string

  constructor(repositoryId: string) {
    this.repositoryId = repositoryId
    this.client = axios.create({ baseURL: this.baseUrl, timeout: 5000 })
  }

  async updateLockfile(
    allPosts: Post[],
    successfulUploads: UploadPostSuccessResponse[],
    currentLockfile?: Lockfile
  ): Promise<UpdateLockfileResponse> {
    // should only happen the first time you run the action in a repository.
    if (!currentLockfile) {
      currentLockfile = {
        id: '',
        repositoryName: process.env.GITHUB_REPOSITORY as string,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        repositoryId: this.repositoryId,
        content: []
      }
    }

    const succesfullyUploadedPosts = allPosts.filter((post) =>
      successfulUploads.find((upload) => upload.data.publishPost.post.slug === post.slug)
    )

    currentLockfile.content = currentLockfile.content.map((content) => {
      const post = succesfullyUploadedPosts.find((entry) => entry.path === content.path)
      if (!post) {
        return content
      }

      const upload = successfulUploads.find((entry) => entry.data.publishPost.post.slug === post.slug)

      return {
        ...content,
        id: upload?.data.publishPost.post.id as string,
        url: upload?.data.publishPost.post.url as string,
        hash: post.hash
      }
    })

    const payload = {
      repositoryName: process.env.GITHUB_REPOSITORY as string,
      posts: currentLockfile.content
    }

    try {
      const response = await this.client.put<UpdateLockfileResponse>(`/lockfiles/${this.repositoryId}`, payload)
      return response.data
    } catch (error: unknown) {
      return isAxiosError(error)
        ? Promise.reject(new Error(JSON.stringify(error.response?.data)))
        : Promise.reject(error)
    }
  }

  async retrieveLockfile(): Promise<RetrieveLockfileResponse> {
    try {
      const response = await this.client.get<RetrieveLockfileResponse>(`/lockfiles/${this.repositoryId}`)
      return response.data
    } catch (error: unknown) {
      return isAxiosError(error)
        ? Promise.reject(new Error(JSON.stringify(error.response?.data)))
        : Promise.reject(error)
    }
  }
}

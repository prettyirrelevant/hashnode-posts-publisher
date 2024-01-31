import axios, { isAxiosError } from 'axios'

import { PostSuccessResponse } from '../schema'
import { log } from '../utils'

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

  async updateLockfile({
    successfulUploads,
    currentLockfile
  }: {
    successfulUploads: PostSuccessResponse[]
    currentLockfile?: Lockfile
  }): Promise<UpdateLockfileResponse> {
    log(`successfulUploads: ${JSON.stringify(successfulUploads)}\ncurrentLockfile: ${JSON.stringify(currentLockfile)}`)
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

    // now we need to update the lockfile with the new posts.
    // case 1: lockfile is empty i.e. no posts have been uploaded yet.
    if (currentLockfile.content.length === 0) {
      currentLockfile.content = successfulUploads.map((entry) => {
        const postData = 'publishPost' in entry.data ? entry.data.publishPost : entry.data.updatePost
        return {
          id: postData.post.id,
          path: postData.post.path,
          hash: postData.post.hash,
          url: postData.post.url
        }
      })
    } else {
      // case 2: lockfile not empty i.e. posts have been uploaded before.
      // we need to be able to update existing posts and add new ones

      // if the post exists in the lockfile, update it.
      currentLockfile.content = currentLockfile.content.map((entry) => {
        const uploadData = successfulUploads.find((upload) => {
          const i = 'publishPost' in upload.data ? upload.data.publishPost : upload.data.updatePost
          return i.post.path === i.post.path
        })

        if (uploadData) {
          const postData = 'publishPost' in uploadData.data ? uploadData.data.publishPost : uploadData.data.updatePost
          return {
            id: postData.post.id,
            path: postData.post.path,
            hash: postData.post.hash,
            url: postData.post.url
          }
        }

        return entry
      })

      // else, add new entries to the lockfile.
      currentLockfile.content = [
        ...currentLockfile.content,
        ...successfulUploads.map((entry) => {
          const postData = 'publishPost' in entry.data ? entry.data.publishPost : entry.data.updatePost
          return {
            id: postData.post.id,
            path: postData.post.path,
            hash: postData.post.hash,
            url: postData.post.url
          }
        })
      ]
    }

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

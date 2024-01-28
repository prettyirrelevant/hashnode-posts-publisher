import axios, { isAxiosError } from 'axios'

import { UploadPostSuccessResponse, Post } from './schema'

export class HashnodeAPI {
  private baseUrl = 'https://gql.hashnode.com'
  private client: axios.AxiosInstance
  private publicationId: string

  constructor(accessToken: string, publicationId: string) {
    this.client = axios.create({
      headers: {
        Authorization: accessToken
      },
      timeout: 5000
    })
    this.publicationId = publicationId
  }

  async uploadDraft(post: Post): Promise<UploadPostSuccessResponse> {
    const query = `
      mutation PublishDraft($input: PublishDraftInput!) {
        publishDraft(input: $input) {
          post {
            id
            slug
            title
          }
        }
      }
    `
    const variables = {
      input: {
        ...(post.attributes.coverImageUrl && { coverImageOptions: { coverImageURL: post.attributes.coverImageUrl } }),
        publicationId: this.publicationId,
        contentMarkdown: post.content,
        title: post.attributes.title,
        tags: post.attributes.tags,
        slug: post.slug
      }
    }

    try {
      const response = await this.client.post(this.baseUrl, { variables, query })
      if (response.data.errors) {
        return Promise.reject(new Error(JSON.stringify(response.data.errors)))
      }

      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return Promise.reject(new Error(JSON.stringify(error.response?.data)))
      }

      return Promise.reject(new Error(JSON.stringify(error)))
    }
  }

  async uploadPost(post: Post): Promise<UploadPostSuccessResponse> {
    const query = `
      mutation PublishPost($input: PublishPostInput!) {
        publishPost(input: $input) {
          post {
            id
            slug
            url
          }
        }
      }
    `
    const variables = {
      input: {
        ...(post.attributes.coverImageUrl && { coverImageOptions: { coverImageURL: post.attributes.coverImageUrl } }),
        publicationId: this.publicationId,
        contentMarkdown: post.content,
        title: post.attributes.title,
        tags: post.attributes.tags,
        slug: post.slug
      }
    }

    try {
      const response = await this.client.post(this.baseUrl, { variables, query })
      if (response.data.errors) {
        return Promise.reject(new Error(JSON.stringify(response.data.errors)))
      }

      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return Promise.reject(new Error(JSON.stringify(error.response?.data)))
      }

      return Promise.reject(new Error(JSON.stringify(error)))
    }
  }
}

import axios from 'axios'

import { Post } from './schema'

export class HashnodeAPI {
  private client: axios.AxiosInstance
  private publicationId: string

  constructor(accessToken: string, publicationId: string) {
    this.client = axios.create({
      headers: {
        Authorization: accessToken
      },
      baseURL: 'https://gql.hashnode.com',
      timeout: 5000
    })
    this.publicationId = publicationId
  }

  async uploadDraft(post: Post): Promise<any> {
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
        coverImageOptions: post.attributes.coverImageUrl ? { coverImageURL: post.attributes.coverImageUrl } : null,
        publicationId: this.publicationId,
        contentMarkdown: post.content,
        title: post.attributes.title,
        tags: post.attributes.tags,
        slug: post.slug
      }
    }

    return await this.client.post('', { variables, query })
  }

  async uploadPost(post: Post): Promise<any> {
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
        coverImageOptions: post.attributes.coverImageUrl ? { coverImageURL: post.attributes.coverImageUrl } : null,
        publicationId: this.publicationId,
        contentMarkdown: post.content,
        title: post.attributes.title,
        tags: post.attributes.tags,
        slug: post.slug
      }
    }

    return await this.client.post('', { variables, query })
  }
}

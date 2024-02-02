import { z } from 'zod'

import { slugifyText } from './utils'

const SupportedFormatsSchema = z.enum(['md', 'html', 'mp3', 'wav'])

export const ActionInputsSchema = z.object({
  supportedFormats: z.string().transform((value) => {
    const formats = value.split(',').map((format) => format.trim())
    return formats.map((format) => SupportedFormatsSchema.parse(format))
  }),
  replicateApiKey: z.string().nullish(),
  postsDirectory: z.string(),
  publicationId: z.string(),
  accessToken: z.string()
})
export type ActionInputs = z.infer<typeof ActionInputsSchema>

const PostAttributesSchema = z.object({
  tags: z.array(z.string()).transform((tags) => tags?.map((tag) => ({ slug: slugifyText(tag), name: tag }))),
  coverImageUrl: z.string().nullish(),
  description: z.string().nullish(),
  draft: z.boolean().default(false),
  title: z.string()
})
export type PostAttributes = z.infer<typeof PostAttributesSchema>

export const PostSchema = z.object({
  attributes: PostAttributesSchema,
  content: z.string(),
  slug: z.string(),
  hash: z.string(),
  path: z.string()
})
export type Post = z.infer<typeof PostSchema>

export type UploadPostSuccessResponse = {
  data: {
    publishPost: {
      post: {
        path: string // this is not part of the response from the API.
        hash: string // this is not part of the response from the API.
        slug: string
        url: string
        id: string
      }
    }
  }
}

export type UpdatePostSuccessResponse = {
  data: {
    updatePost: {
      post: {
        path: string // this is not part of the response from the API.
        hash: string // this is not part of the response from the API.
        slug: string
        url: string
        id: string
      }
    }
  }
}

export type PostSuccessResponse = UploadPostSuccessResponse | UpdatePostSuccessResponse

import slugify from 'slugify'
import { z } from 'zod'

const SupportedFormatsSchema = z.enum(['md', 'html', 'audio'])

export const ActionInputsSchema = z.object({
  supportedFormats: z.string().transform((value) => {
    const formats = value.split(',').map((format) => format.trim())
    return formats.map((format) => SupportedFormatsSchema.parse(format))
  }),
  openaiApiKey: z.string().nullish(),
  postsDirectory: z.string(),
  publicationId: z.string(),
  accessToken: z.string()
})
export type ActionInputs = z.infer<typeof ActionInputsSchema>

const PostAttributesSchema = z.object({
  tags: z.array(z.string()).transform((tags) => tags?.map((tag) => ({ slug: slugify(tag), name: tag }))),
  coverImageUrl: z.string().nullish(),
  description: z.string().nullish(),
  draft: z.boolean().default(false),
  title: z.string()
})
export type PostAttributes = z.infer<typeof PostAttributesSchema>

export const PostSchema = z.object({
  attributes: PostAttributesSchema,
  imageUrl: z.string().nullish(),
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
        slug: string
        url: string
        id: string
      }
    }
  }
}

import slugify from 'slugify'
import { z } from 'zod'

const SupportedFormatsSchema = z.enum(['md', 'html', 'audio'])

export const ActionInputsSchema = z.object({
  supportedFormats: z.string().transform((value) => {
    const formats = value.split(',').map((format) => format.trim())
    return formats.map((format) => SupportedFormatsSchema.parse(format))
  }),
  ignoreDrafts: z.boolean().default(false),
  openaiApiKey: z.string().optional(),
  postsDirectory: z.string(),
  publicationId: z.string(),
  accessToken: z.string()
})
export type ActionInputs = z.infer<typeof ActionInputsSchema>

const PostAttributesSchema = z.object({
  tags: z
    .array(z.string())
    .optional()
    .transform((tags) => tags?.map((tag) => ({ slug: slugify(tag), name: tag }))),
  coverImageUrl: z.string().optional(),
  description: z.string().optional(),
  draft: z.boolean().default(false),
  title: z.string()
})
export type PostAttributes = z.infer<typeof PostAttributesSchema>

const PostSchema = z.object({
  attributes: PostAttributesSchema,
  imageUrl: z.string().optional(),
  content: z.string(),
  slug: z.string(),
  hash: z.string()
})
export type Post = z.infer<typeof PostSchema>

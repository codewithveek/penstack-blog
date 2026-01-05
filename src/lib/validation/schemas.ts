import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("Invalid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const postCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().optional(),
  summary: z.string().max(500).optional(),
  slug: z.string().min(1, "Slug is required").max(255),
  status: z.enum(["draft", "published", "deleted"]).default("draft"),
  visibility: z.enum(["public", "private"]).default("public"),
  author_id: z.string().min(1, "Author ID is required"),
  category_id: z.number().int().positive().optional(),
  featured_image_id: z.number().int().positive().optional(),
  allow_comments: z.boolean().default(false),
  send_newsletter: z.boolean().default(true),
  is_sticky: z.boolean().default(false),
  generate_toc: z.boolean().default(true),
  toc_depth: z.number().int().min(1).max(6).default(2),
  scheduled_at: z.string().datetime().optional(),
});

export const postUpdateSchema = postCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(255),
});

export const tagSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(255),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("Invalid email address").max(255),
  subject: z.string().min(1, "Subject is required").max(255),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const newsletterSubscribeSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
});

export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  post_id: z.number().int().positive(),
  author_id: z.string().min(1, "Author ID is required"),
});

export const replySchema = z.object({
  content: z.string().min(1, "Reply cannot be empty"),
  comment_id: z.number().int().positive(),
  author_id: z.string().min(1, "Author ID is required"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const searchSchema = z.object({
  q: z.string().min(1, "Search query is required").max(255),
  ...paginationSchema.shape,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type TagInput = z.infer<typeof tagSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ReplyInput = z.infer<typeof replySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;

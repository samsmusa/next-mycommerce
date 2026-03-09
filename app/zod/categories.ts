import * as z from "zod";

export const createCategorySchema = z.object({
    name: z.string().min(2, "Category name must be at least 2 characters").max(255),
    slug: z
        .string()
        .min(1, "Slug is required")
        .max(255)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"),
    description: z.string().max(5000).optional().nullable(),
    image: z.string().optional().nullable(),
    parentId: z.string().cuid("Invalid parent category ID").optional().nullable(),
});

export const updateCategorySchema = createCategorySchema;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

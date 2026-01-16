import * as z from "zod"

export const createProductSchema = z.object({
    name: z.string().min(2, "Product name must be at least 2 characters").max(255),
    sku: z.string().min(1, "SKU is required").max(100),
    slug: z
        .string()
        .min(1, "Slug is required")
        .max(255)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"),
    description: z.string().max(5000).optional(),
    price: z.coerce
        .number()
        .positive("Price must be greater than 0")
        .finite("Price must be a valid number"),
    discount: z.coerce
        .number()
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot exceed 100%")
        .default(0),
    quantity: z.coerce.number().int().min(0, "Quantity cannot be negative").default(0),
    categoryId: z.string().cuid("Invalid category ID"),
    createdBy: z.string().cuid("Invalid user ID"),
    coverImageId: z.string().cuid("Invalid cover image ID"),
    mediaIds: z.array(z.string().cuid("Invalid media ID")).default([]),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
});

// export const updateProductSchema = createProductSchema.partial().omit({createdBy: true});
export const updateProductSchema = createProductSchema

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;


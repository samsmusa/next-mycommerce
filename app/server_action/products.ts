"use server";

import prisma from "@/lib/prisma";
import { Product } from "@/app/types/product";
import { PaginatedResponse } from "@/app/types/common";
import {
    CreateProductInput,
    createProductSchema,
    UpdateProductInput,
    updateProductSchema,
} from "@/app/zod/products";
import Decimal from "decimal.js";
import { z } from "zod";

// ============================================================================
// TYPES
// ============================================================================

type PaginationParams = {
    page?: number;
    limit?: number;
};

type FilterOptions = {
    skip?: number;
    take?: number;
    categoryId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    search?: string;
};

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export async function getProducts(
    { page = 1, limit = 10 }: PaginationParams = {}
): Promise<PaginatedResponse<Product>> {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                category: true,
                images: {
                    include: { media: true },
                    orderBy: { order: "asc" },
                },
            },
        }),
        prisma.product.count(),
    ]);

    return {
        data: products.map(serializeProduct),
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getProduct(id: string): Promise<Product> {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
            images: {
                include: { media: true },
                orderBy: { order: "asc" },
            },
            variants: true,
            owner: { select: { id: true, email: true, name: true } },
        },
    });

    if (!product) {
        throw new Error("Product not found");
    }

    return serializeProduct(product);
}

export async function getProductsByFilter(
    options: FilterOptions
): Promise<{
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
}> {
    const { skip = 0, take = 20, categoryId, isActive, search } = options;

    const where = {
        ...(categoryId && { categoryId }),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { sku: { contains: search, mode: "insensitive" as const } },
                { slug: { contains: search, mode: "insensitive" as const } },
            ],
        }),
    };

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                category: true,
                images: {
                    include: { media: true },
                    orderBy: { order: "asc" },
                },
            },
            skip,
            take,
            orderBy: { createdAt: "desc" },
        }),
        prisma.product.count({ where }),
    ]);

    return {
        products: products.map(serializeProduct),
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
    };
}

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

export async function createProduct(input: CreateProductInput): Promise<Product> {
    const validatedData = createProductSchema.parse(input);

    try {
        // Verify cover image exists and belongs to the user
        const coverImage = await prisma.media.findUnique({
            where: { id: validatedData.coverImageId },
        });

        if (!coverImage) {
            throw new Error("Cover image not found");
        }

        // if (coverImage.uploadedBy !== validatedData.createdBy) {
        //     throw new Error("Unauthorized: Cover image does not belong to this user");
        // }

        // Verify category exists
        const category = await prisma.productCategory.findUnique({
            where: { id: validatedData.categoryId },
        });

        if (!category) {
            throw new Error("Category not found");
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: validatedData.createdBy },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Verify all media IDs exist and belong to the user
        if (validatedData.mediaIds.length > 0) {
            const mediaItems = await prisma.media.findMany({
                where: {
                    id: { in: validatedData.mediaIds },
                    // uploadedBy: validatedData.createdBy,
                },
            });

            if (mediaItems.length !== validatedData.mediaIds.length) {
                throw new Error(
                    "Some media items not found or do not belong to this user"
                );
            }
        }

        // Create product and associate media in transaction
        const product = await prisma.$transaction(async (tx) => {
            // Create the product
            const newProduct = await tx.product.create({
                data: {
                    name: validatedData.name,
                    slug: validatedData.slug,
                    sku: validatedData.sku,
                    description: validatedData.description,
                    price: new Decimal(validatedData.price),
                    discount: new Decimal(validatedData.discount),
                    quantity: validatedData.quantity,
                    categoryId: validatedData.categoryId,
                    createdBy: validatedData.createdBy,
                    isActive: validatedData.isActive,
                    isFeatured: validatedData.isFeatured,
                    coverImageId: null
                },
            });

            // Create ProductMedia for cover image
            const coverProductMedia = await tx.productMedia.create({
                data: {
                    productId: newProduct.id,
                    mediaId: validatedData.coverImageId,
                    isPrimary: true,
                    order: 0,
                },
            });

            // Update product with coverImageId
            const updatedProduct = await tx.product.update({
                where: { id: newProduct.id },
                data: { coverImageId: coverProductMedia.id },
                include: {
                    category: true,
                    images: { include: { media: true } },
                },
            });

            // Create ProductMedia for additional images
            if (validatedData.mediaIds.length > 0) {
                await tx.productMedia.createMany({
                    data: validatedData.mediaIds.map((mediaId, index) => ({
                        productId: updatedProduct.id,
                        mediaId,
                        isPrimary: false,
                        order: index + 1,
                    })),
                });
            }

            return updatedProduct;
        });

        return serializeProduct(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(
                `Validation error: ${error.message}`
            );
        }
        throw error;
    }
}

export async function updateProduct(
    id: string,
    input: UpdateProductInput
): Promise<Product> {
    const validatedData = updateProductSchema.parse(input);

    try {
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new Error("Product not found");
        }

        // Verify category exists if updating
        if (validatedData.categoryId) {
            const category = await prisma.productCategory.findUnique({
                where: { id: validatedData.categoryId },
            });

            if (!category) {
                throw new Error("Category not found");
            }
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                ...(validatedData.name && { name: validatedData.name }),
                ...(validatedData.slug && { slug: validatedData.slug }),
                ...(validatedData.sku && { sku: validatedData.sku }),
                ...(validatedData.description !== undefined && {
                    description: validatedData.description,
                }),
                ...(validatedData.price !== undefined && {
                    price: new Decimal(validatedData.price),
                }),
                ...(validatedData.discount !== undefined && {
                    discount: new Decimal(validatedData.discount),
                }),
                ...(validatedData.quantity !== undefined && {
                    quantity: validatedData.quantity,
                }),
                ...(validatedData.categoryId && {
                    categoryId: validatedData.categoryId,
                }),
                ...(validatedData.isActive !== undefined && {
                    isActive: validatedData.isActive,
                }),
                ...(validatedData.isFeatured !== undefined && {
                    isFeatured: validatedData.isFeatured,
                }),
            },
            include: {
                category: true,
                images: { include: { media: true }, orderBy: { order: "asc" } },
            },
        });

        return serializeProduct(updatedProduct);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(
                `Validation error: ${error.message}`
            );
        }
        throw error;
    }
}

export async function deleteProduct(id: string): Promise<{ success: boolean }> {
    try {
        await prisma.product.delete({
            where: { id },
        });
        return { success: true };
    } catch (error) {
        throw new Error("Failed to delete product");
    }
}

export async function addProductMedia(
    productId: string,
    mediaIds: string[]
): Promise<{ count: number }> {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { images: { orderBy: { order: "desc" }, take: 1 } },
    });

    if (!product) {
        throw new Error("Product not found");
    }

    const maxOrder = product.images[0]?.order ?? 0;

    const result = await prisma.productMedia.createMany({
        data: mediaIds.map((mediaId, index) => ({
            productId,
            mediaId,
            order: maxOrder + index + 1,
            isPrimary: false,
        })),
    });

    return { count: result.count };
}

export async function removeProductMedia(
    productId: string,
    mediaId: string
): Promise<{ success: boolean }> {
    await prisma.productMedia.deleteMany({
        where: {
            productId,
            mediaId,
        },
    });
    return { success: true };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function serializeProduct(product: object): Product {
    const prod = product as Record<string, unknown>;

    return {
        ...prod,
        price: prod.price instanceof Decimal ? prod.price.toNumber() : (prod.price as number),
        discount: prod.discount instanceof Decimal
            ? prod.discount.toNumber()
            : (prod.discount as number),
        images: Array.isArray(prod.images)
            ? (prod.images as Array<Record<string, unknown>>).map((img) => ({
                ...img,
                media: img.media || null,
            }))
            : undefined,
    } as unknown as Product;
}
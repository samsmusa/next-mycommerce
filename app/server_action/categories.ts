"use server";

import prisma from "@/lib/prisma";
import {PaginatedResponse} from "@/app/types/common";
import {ProductCategory} from "@/prisma/prisma/client";
import { CreateCategoryInput, UpdateCategoryInput, createCategorySchema, updateCategorySchema } from "@/app/zod/categories";
import { z } from "zod";

type PaginationParams = {
    page?: number;
    limit?: number;
};

export async function getCategories({
                                      page = 1,
                                      limit = 10,
                                  }: PaginationParams = {}): Promise<PaginatedResponse<ProductCategory & { _count?: { products: number } }>> {
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
        prisma.productCategory.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                parent: true,
                _count: {
                    select: { products: true }
                }
            }
        }),
        prisma.productCategory.count(),
    ]);

    return {
        data: categories,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getCategoryById(id: string): Promise<ProductCategory | null> {
    return prisma.productCategory.findUnique({
        where: { id },
        include: {
            parent: true
        }
    });
}

export async function createCategory(input: CreateCategoryInput): Promise<ProductCategory> {
    const validatedData = createCategorySchema.parse(input);

    try {
        const category = await prisma.productCategory.create({
            data: {
                name: validatedData.name,
                slug: validatedData.slug,
                description: validatedData.description,
                image: validatedData.image,
                parentId: validatedData.parentId,
            }
        });
        return category;
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Validation error: ${error.message}`);
        }
        throw error;
    }
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<ProductCategory> {
    const validatedData = updateCategorySchema.parse(input);

    try {
        const category = await prisma.productCategory.update({
            where: { id },
            data: {
                name: validatedData.name,
                slug: validatedData.slug,
                description: validatedData.description,
                image: validatedData.image,
                parentId: validatedData.parentId,
            }
        });
        return category;
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Validation error: ${error.message}`);
        }
        throw error;
    }
}

export async function deleteCategory(id: string): Promise<{ success: boolean }> {
    try {
        await prisma.productCategory.delete({
            where: { id }
        });
        return { success: true };
    } catch (error) {
        throw new Error("Failed to delete category");
    }
}

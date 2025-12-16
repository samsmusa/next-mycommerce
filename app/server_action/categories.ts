"use server";

import prisma from "@/lib/prisma";
import {Category, Product} from "@/app/types/product"
import {PaginatedResponse} from "@/app/types/common";
import {ProductCategoryMaxAggregateOutputType} from "@/prisma/prisma/models/ProductCategory";

type PaginationParams = {
    page?: number;
    limit?: number;
};

export async function getCategories({
                                      page = 1,
                                      limit = 10,
                                  }: PaginationParams = {}): Promise<PaginatedResponse<ProductCategoryMaxAggregateOutputType>> {
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
        prisma.productCategory.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            // include: {
            //     category: {
            //         select: {
            //             id: true,
            //             name: true,
            //             slug: true,
            //         },
            //     },
            // },
        }),
        prisma.productCategory.count(),
    ]);

    const data = categories.map(category => ({
        ...category,
    }));

    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

type CreateProductInput = {
    name: string;
    slug: string;
    sku: string;
    description?: string;
    price: number;
    discount?: number;
    categoryId: string;
    createdBy: string;
};

export async function createProduct(
    data: CreateProductInput
): Promise<Product> {
    const product = await prisma.product.create({
        data: {
            name: data.name,
            slug: data.slug,
            sku: data.sku,
            description: data.description,
            price: data.price,
            discount: data.discount,
            categoryId: data.categoryId,
            createdBy: data.createdBy,
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });

    return {
        ...product,
        price: product.price?.toNumber(),
        discount: product.discount?.toNumber(),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
    };
}



export async function getProductById(
    id: string
): Promise<Product | null> {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });

    if (!product) return null;

    return {
        ...product,
        price: product.price?.toNumber(),
        discount: product.discount?.toNumber(),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
    };
}

type UpdateProductInput = {
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    discount?: number;
    categoryId?: string;
};

export async function updateProduct(
    id: string,
    data: UpdateProductInput
): Promise<Product> {
    const product = await prisma.product.update({
        where: { id },
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            price: data.price,
            discount: data.discount,
            ...(data.categoryId && {
                category: {
                    connect: { id: data.categoryId },
                },
            }),
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });

    return {
        ...product,
        price: product.price?.toNumber(),
        discount: product.discount?.toNumber(),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
    };
}

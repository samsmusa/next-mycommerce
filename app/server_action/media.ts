"use server";

import prisma from "@/lib/prisma";
import {Media} from "@/app/types/media";
import {PaginatedResponse} from "@/app/types/common";

import path from "path";
import fs from "fs";
import sharp from "sharp";
import {v4 as uuidv4} from "uuid";

const UPLOAD_DIR = path.resolve(process.env.ROOT_PATH ?? "", "public/uploads");
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

type PaginationParams = {
    page?: number;
    limit?: number;
};

type MediaFilters = {
    folder?: string;
    status?: "ACTIVE" | "ARCHIVED" | "DELETED";
    tags?: string[];
    uploadedBy?: string;
};

/**
 * Get all media with pagination and filters
 */
export async function getMedia(
    {page = 1, limit = 20}: PaginationParams = {},
    filters?: MediaFilters
): Promise<PaginatedResponse<Media>> {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.status) {
        where.status = filters.status;
    }

    if (filters?.folder) {
        where.folder = filters.folder;
    }

    if (filters?.uploadedBy) {
        where.uploadedBy = filters.uploadedBy;
    }

    if (filters?.tags && filters.tags.length > 0) {
        where.tags = {hasSome: filters.tags};
    }

    const [media, total] = await Promise.all([
        prisma.media.findMany({
            where,
            skip,
            take: limit,
            orderBy: {createdAt: "desc"},
            select: {
                id: true,
                filename: true,
                originalName: true,
                mimeType: true,
                size: true,
                url: true,
                alt: true,
                description: true,
                tags: true,
                width: true,
                height: true,
                status: true,
                featured: true,
                folder: true,
                createdAt: true,
                updatedAt: true,
                uploadedBy: true,
            },
        }),
        prisma.media.count({where}),
    ]);

    return {
        data: media as Media[],
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}


export async function searchMedia(
    query: string,
    filters?: MediaFilters
): Promise<Media[]> {
    const where: any = {
        status: "ACTIVE",
        ...filters,
    };

    if (query) {
        where.OR = [
            {originalName: {contains: query, mode: "insensitive"}},
            {description: {contains: query, mode: "insensitive"}},
            {alt: {contains: query, mode: "insensitive"}},
            {tags: {hasSome: [query]}},
        ];
    }

    if (filters?.folder) {
        where.folder = filters.folder;
    }

    if (filters?.uploadedBy) {
        where.uploadedBy = filters.uploadedBy;
    }

    if (filters?.tags && filters.tags.length > 0) {
        where.tags = {hasSome: filters.tags};
    }

    const media = await prisma.media.findMany({
        where,
        take: 50,
        orderBy: {createdAt: "desc"},
        select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
            url: true,
            alt: true,
            description: true,
            tags: true,
            width: true,
            height: true,
            status: true,
            featured: true,
            folder: true,
            createdAt: true,
            updatedAt: true,
            uploadedBy: true,
        },
    });

    return media as Media[];
}

/**
 * Get media by ID
 */
export async function getMediaById(id: string): Promise<Media | null> {
    const media = await prisma.media.findUnique({
        where: {id},
        select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
            url: true,
            alt: true,
            description: true,
            tags: true,
            storageKey: true,
            bucket: true,
            width: true,
            height: true,
            status: true,
            featured: true,
            folder: true,
            createdAt: true,
            updatedAt: true,
            uploadedBy: true,
        },
    });

    return media as Media | null;
}

/**
 * Get multiple media by IDs
 */
export async function getMediaByIds(ids: string[]): Promise<Media[]> {
    if (ids.length === 0) return [];

    const media = await prisma.media.findMany({
        where: {id: {in: ids}},
        select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
            url: true,
            alt: true,
            description: true,
            tags: true,
            width: true,
            height: true,
            status: true,
            featured: true,
            folder: true,
            createdAt: true,
            updatedAt: true,
            uploadedBy: true,
        },
    });

    // Preserve order of IDs
    return ids
        .map((id) => media.find((m) => m.id === id))
        .filter(Boolean) as Media[];
}



/**
 * Ensure upload directory exists
 */
function ensureUploadDir() {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, {recursive: true});
    }
}

/**
 * Generate unique filename
 */
function generateFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const uuid = uuidv4().split("-")[0];
    return `${name}-${uuid}${ext}`;
}

/**
 * Get image dimensions
 */
async function getImageDimensions(
    buffer: Buffer,
    mimeType: string
): Promise<{ width?: number; height?: number }> {
    if (!mimeType.startsWith("image/")) {
        return {};
    }

    try {
        const metadata = await sharp(buffer).metadata();
        return {
            width: metadata.width,
            height: metadata.height,
        };
    } catch (error) {
        console.error("Failed to get image dimensions:", error);
        return {};
    }
}

/**
 * Upload file to local storage and create media record
 */
export async function uploadMedia(
    file: File,
    fileName: string,
    uploadedBy: string,
    metadata?: {
        alt?: string;
        description?: string;
        tags?: string[];
        folder?: string;
    }
): Promise<Media> {
    try {
        ensureUploadDir();

        // Generate unique filename
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // Verify file size matches
        if (fileBuffer.length !== file.size) {
            throw new Error("File size mismatch");
        }

        // Generate unique filename
        const uniqueFileName = generateFileName(file.name);
        const filePath = path.join(UPLOAD_DIR, uniqueFileName);

        // Write file to disk
        fs.writeFileSync(filePath, fileBuffer);

        // Get image dimensions if it's an image
        const dimensions = await getImageDimensions(fileBuffer, file.type);

        // Create media record in database
        const media = await prisma.media.create({
            data: {
                filename: uniqueFileName,
                originalName: fileName,
                mimeType: file.type,
                size: fileBuffer.length,
                url: `${BASE_URL}/uploads/${uniqueFileName}`,
                storageKey: uniqueFileName,
                uploadedBy,
                alt: metadata?.alt,
                description: metadata?.description,
                tags: metadata?.tags || [],
                folder: metadata?.folder,
                width: dimensions.width,
                height: dimensions.height,
                status: "ACTIVE",
            },
            select: {
                id: true,
                filename: true,
                originalName: true,
                mimeType: true,
                size: true,
                url: true,
                alt: true,
                description: true,
                tags: true,
                width: true,
                height: true,
                status: true,
                featured: true,
                folder: true,
                createdAt: true,
                updatedAt: true,
                uploadedBy: true,
            },
        });

        return media as Media;
    } catch (error) {
        console.error("Upload error:", error);
        throw new Error("Failed to upload media");
    }
}


type UpdateMediaInput = {
    alt?: string;
    description?: string;
    tags?: string[];
    featured?: boolean;
    folder?: string;
    status?: "ACTIVE" | "ARCHIVED" | "DELETED";
};

/**
 * Update media record
 */
export async function updateMedia(
    id: string,
    data: UpdateMediaInput
): Promise<Media> {
    const media = await prisma.media.update({
        where: {id},
        data: {
            alt: data.alt,
            description: data.description,
            tags: data.tags,
            featured: data.featured,
            folder: data.folder,
            status: data.status,
        },
        select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
            url: true,
            alt: true,
            description: true,
            tags: true,
            width: true,
            height: true,
            status: true,
            featured: true,
            folder: true,
            createdAt: true,
            updatedAt: true,
            uploadedBy: true,
        },
    });

    return media as Media;
}

/**
 * Bulk update media records
 */
export async function updateMediaBulk(
    ids: string[],
    data: UpdateMediaInput
): Promise<Media[]> {
    if (ids.length === 0) return [];

    await prisma.media.updateMany({
        where: {id: {in: ids}},
        data: {
            alt: data.alt,
            description: data.description,
            tags: data.tags,
            featured: data.featured,
            folder: data.folder,
            status: data.status,
        },
    });

    return getMediaByIds(ids);
}

/**
 * Delete media record (soft delete - mark as deleted)
 */
export async function deleteMedia(id: string): Promise<void> {
    await prisma.media.update({
        where: {id},
        data: {status: "DELETED"},
    });
}

/**
 * Bulk delete media records (soft delete)
 */
export async function deleteMediaBulk(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    await prisma.media.updateMany({
        where: {id: {in: ids}},
        data: {status: "DELETED"},
    });
}

/**
 * Permanently delete media record (from database, storage cleanup separate)
 */
export async function permanentlyDeleteMedia(id: string): Promise<void> {
    await prisma.media.delete({
        where: {id},
    });
}

/**
 * Get featured media
 */
export async function getFeaturedMedia(
    limit: number = 10
): Promise<Media[]> {
    const media = await prisma.media.findMany({
        where: {
            featured: true,
            status: "ACTIVE",
        },
        take: limit,
        orderBy: {createdAt: "desc"},
        select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
            url: true,
            alt: true,
            description: true,
            tags: true,
            width: true,
            height: true,
            status: true,
            featured: true,
            folder: true,
            createdAt: true,
            updatedAt: true,
            uploadedBy: true,
        },
    });

    return media as Media[];
}


export async function getMediaByFolder(
    folder: string,
    {page = 1, limit = 20}: PaginationParams = {}
): Promise<PaginatedResponse<Media>> {
    const skip = (page - 1) * limit;

    const [media, total] = await Promise.all([
        prisma.media.findMany({
            where: {
                folder,
                status: "ACTIVE",
            },
            skip,
            take: limit,
            orderBy: {createdAt: "desc"},
            select: {
                id: true,
                filename: true,
                originalName: true,
                mimeType: true,
                size: true,
                url: true,
                alt: true,
                description: true,
                tags: true,
                width: true,
                height: true,
                status: true,
                featured: true,
                folder: true,
                createdAt: true,
                updatedAt: true,
                uploadedBy: true,
            },
        }),
        prisma.media.count({
            where: {
                folder,
                status: "ACTIVE",
            },
        }),
    ]);

    return {
        data: media as Media[],
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}



export async function getMediaByName(
    name: string,
    {page = 1, limit = 20}: PaginationParams = {}
): Promise<PaginatedResponse<Media>> {
    const skip = (page - 1) * limit;

    const where = {
        status: "ACTIVE" as const,
        ...(name && {
            filename: {
                contains: name,
                mode: "insensitive" as const,
            },
        }),
    };

    const [media, total] = await Promise.all([
        prisma.media.findMany({
            where,
            skip,
            take: limit,
            orderBy: {createdAt: "desc"},
            select: {
                id: true,
                filename: true,
                originalName: true,
                mimeType: true,
                size: true,
                url: true,
                alt: true,
                description: true,
                tags: true,
                width: true,
                height: true,
                status: true,
                featured: true,
                folder: true,
                createdAt: true,
                updatedAt: true,
                uploadedBy: true,
            },
        }),
        prisma.media.count({
            where: {
                status: "ACTIVE",
            },
        }),
    ]);

    return {
        data: media as Media[],
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}


export async function getMediaFolders(): Promise<string[]> {
    const folders = await prisma.media.findMany({
        distinct: ["folder"],
        select: {folder: true},
        where: {status: "ACTIVE", folder: {not: null}},
    });

    return folders
        .map((f) => f.folder)
        .filter(Boolean) as string[];
}

/**
 * Get all available tags
 */
export async function getMediaTags(): Promise<string[]> {
    const media = await prisma.media.findMany({
        distinct: ["tags"],
        select: {tags: true},
        where: {status: "ACTIVE"},
    });

    const allTags = new Set<string>();
    media.forEach((m) => m.tags.forEach((tag) => allTags.add(tag)));

    return Array.from(allTags).sort();
}

/**
 * Get media statistics
 */
export async function getMediaStats(uploadedBy?: string) {
    const where = uploadedBy ? {uploadedBy} : {};

    const [totalCount, totalSize, activeCount, deletedCount, archivedCount] = await Promise.all([
        prisma.media.count({where}),
        prisma.media.aggregate({
            _sum: {size: true},
            where,
        }),
        prisma.media.count({where: {...where, status: "ACTIVE"}}),
        prisma.media.count({where: {...where, status: "DELETED"}}),
        prisma.media.count({where: {...where, status: "ARCHIVED"}}),
    ]);

    return {
        totalCount,
        totalSize: totalSize._sum.size || 0,
        totalSizeGB: ((totalSize._sum.size || 0) / 1024 / 1024 / 1024).toFixed(2),
        activeCount,
        deletedCount,
        archivedCount,
    };
}
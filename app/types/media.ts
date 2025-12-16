// app/types/media.ts

export type MediaStatus = "ACTIVE" | "ARCHIVED" | "DELETED";

export interface Media {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number; // File size in bytes
    url: string; // Cloud storage URL
    alt?: string;
    description?: string;
    tags: string[];
    storageKey?: string;
    bucket?: string;
    width?: number; // Image width in pixels
    height?: number; // Image height in pixels
    status: MediaStatus;
    featured: boolean;
    folder?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    uploadedBy: string;
}

export interface MediaUploadResponse {
    success: boolean;
    data?: Media;
    error?: string;
}

export interface MediaSearchParams {
    query?: string;
    folder?: string;
    tags?: string[];
    status?: MediaStatus;
    uploadedBy?: string;
    page?: number;
    limit?: number;
}
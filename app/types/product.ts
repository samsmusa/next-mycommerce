import {ProductCategory, Product as PrismaProduct} from "@/prisma/prisma/client";
import {Prisma} from "@/prisma/prisma/client";

export type Category = ProductCategory;

export type Product = Omit<PrismaProduct, 'price' | 'discount'> & {
    discount: number;
    price: number;
    category?: Category;
    images?: ProductMedia[];
}


// Enum for demo categories
export enum CategoryType {
    ELECTRONICS = 'Electronics',
    CLOTHING = 'Clothing',
    HOME = 'Home',
    BOOKS = 'Books'
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'slug'> & {
    slug?: string; // Optional in form, generated if empty
};

export type ProductMedia = Prisma.ProductMediaGetPayload<{
    include: { media: true }
}>;
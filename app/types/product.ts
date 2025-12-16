import {ProductMinAggregateOutputType} from "@/prisma/prisma/models/Product";
import {ProductCategoryMaxAggregateOutputType} from "@/prisma/prisma/models/ProductCategory";

// export type Common ={
//     createdAt: string;
//     updatedAt: string;
// }
// type CommonLiteral = 'createdAt'|'updatedAt';

export type Category = Omit<ProductCategoryMaxAggregateOutputType, "id"> & {
    id: string;
    name: string;
    slug: string;
}

export type Product = Omit<ProductMinAggregateOutputType, 'price' | 'discount'> & {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sku: string;
    discount: number;
    price: number;
    quantity: number;
    isActive: boolean;
    isFeatured: boolean;
    categoryId: string;
    createdBy: string;
    category?: Category;
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
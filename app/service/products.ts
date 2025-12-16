import { GoogleGenAI } from "@google/genai";
import { Product, PaginatedResponse, CategoryType } from "../types";
import { generateSlug } from "../lib/utils";

// --- Mock Data Store ---
const STORAGE_KEY = 'prisma_products_mock_db';

const initialProducts: Product[] = Array.from({ length: 25 }).map((_, i) => ({
    id: `cuid-${i + 1}`,
    name: `Product Sample ${i + 1}`,
    slug: `product-sample-${i + 1}`,
    description: `This is a high-quality sample product ${i + 1} suitable for various needs.`,
    sku: `SKU-${1000 + i}`,
    price: 100 + i * 10,
    discount: i % 3 === 0 ? 10 : 0,
    quantity: 50,
    isActive: i % 5 !== 0,
    isFeatured: i % 10 === 0,
    categoryId: Object.values(CategoryType)[i % 4],
    createdBy: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}));

const getLocalProducts = (): Product[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialProducts;
};

const setLocalProducts = (products: Product[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

// --- Mock Service Methods ---

export const getProducts = async (page = 1, limit = 10, search = ""): Promise<PaginatedResponse<Product>> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    let products = getLocalProducts();

    if (search) {
        const lower = search.toLowerCase();
        products = products.filter(p =>
            p.name.toLowerCase().includes(lower) ||
            p.sku.toLowerCase().includes(lower)
        );
    }

    const total = products.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = products.slice(start, end);

    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return getLocalProducts().find(p => p.id === id);
};

export const createProduct = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Product> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const products = getLocalProducts();
    const newProduct: Product = {
        ...data,
        id: `cuid-${Date.now()}`,
        createdBy: 'admin-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slug: data.slug || generateSlug(data.name),
    };

    setLocalProducts([newProduct, ...products]);
    return newProduct;
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const products = getLocalProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found");

    const updatedProduct = {
        ...products[index],
        ...data,
        updatedAt: new Date().toISOString(),
    };

    products[index] = updatedProduct;
    setLocalProducts(products);
    return updatedProduct;
};

export const deleteProduct = async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const products = getLocalProducts().filter(p => p.id !== id);
    setLocalProducts(products);
};

// --- Gemini AI Integration ---

export const generateProductDescription = async (name: string, category: string, sku: string): Promise<string> => {
    try {
        if(!process.env.API_KEY) {
            throw new Error("API Key not found");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a compelling, SEO-friendly product description (approx 80-100 words) for a product named "${name}". 
      Category: ${category}. 
      SKU: ${sku}.
      Highlight its key features and why a customer should buy it. 
      Tone: Professional and persuasive.
      Return ONLY the description text, no markdown headers.`,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Gemini AI Error:", error);
        // Fallback if API fails or key is missing
        return `Premium quality ${name} designed for the modern ${category} enthusiast. SKU: ${sku}. Experience superior performance and durability.`;
    }
};
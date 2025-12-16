import prisma from "@/lib/prisma";

export async function main() {
    console.log("🌱 Seeding product categories...");

    // Parent categories
    const electronics = await prisma.productCategory.upsert({
        where: { slug: "electronics" },
        update: {},
        create: {
            name: "Electronics",
            slug: "electronics",
            description: "Electronic products and devices",
            image: "/images/categories/electronics.png",
        },
    });

    const fashion = await prisma.productCategory.upsert({
        where: { slug: "fashion" },
        update: {},
        create: {
            name: "Fashion",
            slug: "fashion",
            description: "Clothing and fashion accessories",
            image: "/images/categories/fashion.png",
        },
    });

    // Child categories
    await prisma.productCategory.upsert({
        where: { slug: "mobile-phones" },
        update: {},
        create: {
            name: "Mobile Phones",
            slug: "mobile-phones",
            parentId: electronics.id,
        },
    });

    await prisma.productCategory.upsert({
        where: { slug: "laptops" },
        update: {},
        create: {
            name: "Laptops",
            slug: "laptops",
            parentId: electronics.id,
        },
    });

    await prisma.productCategory.upsert({
        where: { slug: "mens-clothing" },
        update: {},
        create: {
            name: "Men's Clothing",
            slug: "mens-clothing",
            parentId: fashion.id,
        },
    });

    await prisma.productCategory.upsert({
        where: { slug: "womens-clothing" },
        update: {},
        create: {
            name: "Women's Clothing",
            slug: "womens-clothing",
            parentId: fashion.id,
        },
    });

    console.log("✅ Seeding finished.");
}

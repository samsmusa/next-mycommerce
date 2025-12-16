import prisma from "@/lib/prisma";
import Decimal from "decimal.js";

export async function main() {
    console.log("🌱 Seeding categories and products...");

    /* -------------------------
       Get required relations
    --------------------------*/

    const adminUser = await prisma.user.findFirst();
    if (!adminUser) {
        throw new Error("❌ No user found. Seed users first.");
    }

    const electronics = await prisma.productCategory.findUnique({
        where: {slug: "electronics"},
    });

    const fashion = await prisma.productCategory.findUnique({
        where: {slug: "fashion"},
    });

    if (!electronics || !fashion) {
        throw new Error("❌ Categories not found. Seed categories first.");
    }

    /* -------------------------
       Seed Products
    --------------------------*/

    await prisma.product.upsert({
        where: {slug: "iphone-15-pro"},
        update: {},
        create: {
            name: "iPhone 15 Pro",
            slug: "iphone-15-pro",
            description: "Apple iPhone 15 Pro with A17 chip",
            additinal_info: {
                brand: "Apple",
                color: "Titanium",
                storage: "256GB",
            },
            sku: "APL-IP15PRO-256",
            price: new Decimal(1499.99),
            discount: new Decimal(100.0),
            quantity: 50,
            isFeatured: true,
            createdBy: adminUser.id,
            categoryId: electronics.id,
        },
    });

    await prisma.product.upsert({
        where: {slug: "samsung-galaxy-s24"},
        update: {},
        create: {
            name: "Samsung Galaxy S24",
            slug: "samsung-galaxy-s24",
            description: "Samsung Galaxy S24 flagship smartphone",
            additinal_info: {
                brand: "Samsung",
                color: "Black",
                storage: "128GB",
            },
            sku: "SMS-S24-128",
            price: new Decimal(999.99),
            quantity: 80,
            createdBy: adminUser.id,
            categoryId: electronics.id,
        },
    });

    await prisma.product.upsert({
        where: {slug: "mens-leather-jacket"},
        update: {},
        create: {
            name: "Men's Leather Jacket",
            slug: "mens-leather-jacket",
            description: "Premium leather jacket for men",
            additinal_info: {
                material: "Genuine Leather",
                fit: "Regular",
            },
            sku: "FSH-JKT-M-001",
            price: new Decimal(199.99),
            discount: new Decimal(20),
            quantity: 30,
            createdBy: adminUser.id,
            categoryId: fashion.id,
        },
    });

    console.log("✅ Product seeding completed.");
}

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function main() {
    console.log("🔐 Seeding accounts...");

    const admin = await prisma.user.findUnique({
        where: { phone: "01700000001" },
    });

    const customer = await prisma.user.findUnique({
        where: { phone: "01700000002" },
    });

    if (!admin || !customer) {
        throw new Error("❌ Users not found. Run user seed first.");
    }

    await prisma.account.upsert({
        where: {
            providerId_accountId: {
                providerId: "credentials",
                accountId: admin.phone,
            },
        },
        update: {},
        create: {
            providerId: "credentials",
            accountId: admin.phone,
            userId: admin.id,
            password: await bcrypt.hash("Admin@123", 10),
        },
    });

    await prisma.account.upsert({
        where: {
            providerId_accountId: {
                providerId: "credentials",
                accountId: customer.phone,
            },
        },
        update: {},
        create: {
            providerId: "credentials",
            accountId: customer.phone,
            userId: customer.id,
            password: await bcrypt.hash("User@123", 10),
        },
    });

    console.log("✅ Accounts seeded.");
}

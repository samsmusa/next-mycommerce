import prisma from "@/lib/prisma";
import {UserRole, UserStatus} from "@/prisma/prisma/enums";

export async function main() {
    console.log("👤 Seeding users...");

    const users = [
        {
            name: "Admin User",
            phone: "01700000001",
            email: "admin@example.com",
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
        },
        {
            name: "John Doe",
            phone: "01700000002",
            email: "john@example.com",
            role: UserRole.CUSTOMER,
        },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: {phone: user.phone},
            update: {},
            create: user,
        });
    }

    console.log("✅ Users seeded.");
}

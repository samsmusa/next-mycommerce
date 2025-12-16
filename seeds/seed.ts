// import {main as userSeed} from "@/seeds/seeders/user.seed"
// import {main as accountSeed} from "@/seeds/seeders/account.seed"
// import {main as productCategorySeed} from "@/seeds/seeders/productCategory.seed"
// import prisma from "@/lib/prisma";
//
// export async function main() {
//     await userSeed()
//     await accountSeed()
//     await productCategorySeed()
// }
//
// main()
//     .catch((e) => {
//         console.error("❌ Seeding failed:", e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
import prisma from "@/lib/prisma";
import path from "path";
import fs from "fs";

async function runSeeds() {
    const seedDir = path.join(process.cwd(), "seeds/seeders");

    // Read all seed files
    const seedFiles = fs
        .readdirSync(seedDir)
        .filter((file) => file.endsWith(".seed.ts"))
        .sort(); // 👈 ensures order (01_, 02_)

    console.log("🌱 Running seeds:");
    seedFiles.forEach((f) => console.log(" -", f));

    for (const file of seedFiles) {
        const seedPath = path.join(seedDir, file);

        const seedModule = await import(seedPath);

        if (typeof seedModule.main !== "function") {
            throw new Error(`❌ ${file} does not export a main() function`);
        }

        console.log(`▶ Running ${file}`);
        await seedModule.main();
    }
}

export async function main() {
    try {
        await runSeeds();
        console.log("✅ All seeds executed successfully");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run automatically
main();

import { PrismaClient } from "@prisma/client";
import insurersData from "../src/data/insurers.json";
import packagesData from "../src/data/packages.json";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration...");

  // 1. Migrate Insurers
  for (const insurer of insurersData.insurers) {
    console.log(`Migrating insurer: ${insurer.name}`);
    await prisma.insurer.upsert({
      where: { id: insurer.id },
      update: {
        name: insurer.name,
        fullName: insurer.fullName,
        logoPath: insurer.logoPath,
        active: true,
      },
      create: {
        id: insurer.id,
        name: insurer.name,
        fullName: insurer.fullName,
        logoPath: insurer.logoPath,
        active: true,
      },
    });
  }

  // 2. Migrate Products (Packages)
  for (const pkg of packagesData.packages) {
    const productId = `${pkg.insurerId}_${pkg.productName.replace(/\s+/g, "_").toLowerCase()}`;
    console.log(`Migrating product: ${pkg.productName} for ${pkg.insurerId}`);
    
    await prisma.product.upsert({
      where: { id: productId },
      update: {
        name: pkg.productName,
        productCode: pkg.productName === "MSIG Business Plus" ? "ABU070124" : (pkg.productName.includes("EQ") ? "FGP2401" : "JAN 2024"), // Fallback/Estimate
        configuration: JSON.stringify(pkg),
        active: true,
      },
      create: {
        id: productId,
        insurerId: pkg.insurerId,
        name: pkg.productName,
        productCode: pkg.productName === "MSIG Business Plus" ? "ABU070124" : (pkg.productName.includes("EQ") ? "FGP2401" : "JAN 2024"), // Fallback/Estimate
        configuration: JSON.stringify(pkg),
        active: true,
      },
    });
  }

  console.log("Migration completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

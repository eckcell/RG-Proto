import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL || "admin@riskguard.com";
  const password = process.env.INITIAL_ADMIN_PASSWORD || "admin123";

  console.log(`Setting up initial admin: ${email}...`);

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "ADMIN"
    },
    create: {
      email,
      password: hashedPassword,
      name: "Root Admin",
      role: "ADMIN"
    }
  });

  console.log("Admin setup complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

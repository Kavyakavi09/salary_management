import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const departments = [
    "Engineering",
    "Human Resources",
    "Finance",
    "Sales",
    "Operations",
  ];

  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const name = process.env.SEED_HR_NAME || "ACME HR";
  const email = process.env.SEED_HR_EMAIL || "hr@acme.com";
  const password = process.env.SEED_HR_PASSWORD || "Password123!";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.hrUser.upsert({
    where: { email },
    update: { name, passwordHash, role: "hr_admin" },
    create: {
      name,
      email,
      passwordHash,
      role: "hr_admin",
    },
  });

  console.log(`Seeded departments and HR user: ${user.name} <${user.email}>`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

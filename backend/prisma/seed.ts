import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const currencies = [
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "USD", name: "US Dollar", symbol: "$" },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: { name: currency.name, symbol: currency.symbol },
      create: currency,
    });
  }

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

  const countries = [
    { name: "India", currencyCode: "INR", tdsRate: 0.2 },
    { name: "United States", currencyCode: "USD", tdsRate: 0.3 },
    { name: "Other", currencyCode: "USD", tdsRate: 0 },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { name: country.name },
      update: {
        currencyCode: country.currencyCode,
        tdsRate: country.tdsRate,
      },
      create: country,
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

  console.log(
    `Seeded currencies, departments, countries, and HR user: ${user.name} <${user.email}>`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

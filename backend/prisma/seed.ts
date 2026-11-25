import "dotenv/config";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient, type PayPeriod } from "@prisma/client";

const prisma = new PrismaClient();

const EMPLOYEE_COUNT = Number(process.env.SEED_EMPLOYEE_COUNT || 10_000);
const BATCH_SIZE = 500;

const FIRST_NAMES = [
  "Aarav",
  "Ada",
  "Amelia",
  "Ananya",
  "Arjun",
  "Chen",
  "Diego",
  "Elena",
  "Fatima",
  "Grace",
  "Hiro",
  "Isha",
  "James",
  "Kai",
  "Lina",
  "Maya",
  "Noah",
  "Omar",
  "Priya",
  "Quinn",
  "Rohan",
  "Sofia",
  "Tara",
  "Uma",
  "Victor",
  "Wendy",
  "Xavier",
  "Yuki",
  "Zara",
  "Leo",
];

const LAST_NAMES = [
  "Sharma",
  "Patel",
  "Lovelace",
  "Singh",
  "Garcia",
  "Nguyen",
  "Kim",
  "Müller",
  "Silva",
  "Brown",
  "Wilson",
  "Martinez",
  "Anderson",
  "Taylor",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Clark",
  "Lewis",
  "Walker",
  "Young",
  "King",
  "Wright",
  "Scott",
  "Green",
  "Baker",
  "Adams",
  "Nelson",
  "Carter",
];

const DEPARTMENT_JOBS: Record<string, string[]> = {
  Engineering: [
    "Software Engineer",
    "Senior Engineer",
    "Engineering Manager",
    "DevOps Engineer",
    "QA Engineer",
  ],
  Product: ["Product Manager", "Product Designer", "Product Analyst"],
  Analytics: ["Data Analyst", "Data Scientist", "Analytics Engineer"],
  "Human Resources": ["HR Specialist", "Recruiter", "HR Business Partner"],
  Finance: ["Accountant", "Financial Analyst", "Controller"],
  Sales: ["Account Executive", "Sales Manager", "Sales Development Rep"],
  Operations: ["Operations Manager", "Program Manager", "Coordinator"],
  Marketing: ["Marketing Manager", "Content Strategist", "Growth Marketer"],
};

type CountrySeed = {
  name: string;
  currencyCode: string;
  tdsRate: number;
  payPeriod: PayPeriod;
  minAmount: number;
  maxAmount: number;
};

const pick = <T>(items: T[], index: number): T => items[index % items.length];

const amountFor = (min: number, max: number, index: number) => {
  const span = max - min;
  const stepped = min + ((index * 97) % (span + 1));
  return Math.round(stepped / 100) * 100;
};

const hireDateFor = (index: number) => {
  const start = new Date("2018-01-01").getTime();
  const end = new Date("2025-10-01").getTime();
  const t = start + ((index * 7919) % (end - start));
  return new Date(t);
};

const employeeCode = (n: number) => `EMP${String(n).padStart(5, "0")}`;

async function seedReferenceData() {
  const currencies = [
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: { name: currency.name, symbol: currency.symbol },
      create: currency,
    });
  }

  const departments = Object.keys(DEPARTMENT_JOBS);
  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const countries: CountrySeed[] = [
    {
      name: "India",
      currencyCode: "INR",
      tdsRate: 0.2,
      payPeriod: "monthly",
      minAmount: 45_000,
      maxAmount: 280_000,
    },
    {
      name: "United States",
      currencyCode: "USD",
      tdsRate: 0.3,
      payPeriod: "annual",
      minAmount: 72_000,
      maxAmount: 210_000,
    },
    {
      name: "Germany",
      currencyCode: "EUR",
      tdsRate: 0.25,
      payPeriod: "annual",
      minAmount: 55_000,
      maxAmount: 140_000,
    },
    {
      name: "United Kingdom",
      currencyCode: "GBP",
      tdsRate: 0.22,
      payPeriod: "annual",
      minAmount: 42_000,
      maxAmount: 130_000,
    },
    {
      name: "Canada",
      currencyCode: "CAD",
      tdsRate: 0.25,
      payPeriod: "annual",
      minAmount: 65_000,
      maxAmount: 160_000,
    },
    {
      name: "Australia",
      currencyCode: "AUD",
      tdsRate: 0.24,
      payPeriod: "annual",
      minAmount: 70_000,
      maxAmount: 170_000,
    },
    {
      name: "Singapore",
      currencyCode: "SGD",
      tdsRate: 0.15,
      payPeriod: "monthly",
      minAmount: 5_500,
      maxAmount: 18_000,
    },
    {
      name: "Japan",
      currencyCode: "JPY",
      tdsRate: 0.2,
      payPeriod: "monthly",
      minAmount: 350_000,
      maxAmount: 1_200_000,
    },
    {
      name: "Netherlands",
      currencyCode: "EUR",
      tdsRate: 0.26,
      payPeriod: "annual",
      minAmount: 50_000,
      maxAmount: 135_000,
    },
    {
      name: "Ireland",
      currencyCode: "EUR",
      tdsRate: 0.28,
      payPeriod: "annual",
      minAmount: 48_000,
      maxAmount: 145_000,
    },
    {
      name: "UAE",
      currencyCode: "USD",
      tdsRate: 0,
      payPeriod: "monthly",
      minAmount: 8_000,
      maxAmount: 28_000,
    },
    {
      name: "Other",
      currencyCode: "USD",
      tdsRate: 0,
      payPeriod: "monthly",
      minAmount: 3_000,
      maxAmount: 12_000,
    },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { name: country.name },
      update: {
        currencyCode: country.currencyCode,
        tdsRate: country.tdsRate,
      },
      create: {
        name: country.name,
        currencyCode: country.currencyCode,
        tdsRate: country.tdsRate,
      },
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

  const departmentRows = await prisma.department.findMany({
    orderBy: { id: "asc" },
  });
  const countryRows = await prisma.country.findMany({ orderBy: { id: "asc" } });

  const countryMeta = new Map(
    countries.map((country) => [country.name, country] as const)
  );

  return { user, departmentRows, countryRows, countryMeta };
}

async function seedEmployees(
  createdById: string,
  departmentRows: { id: number; name: string }[],
  countryRows: { id: number; name: string; currencyCode: string }[],
  countryMeta: Map<string, CountrySeed>
) {
  const existing = await prisma.employee.count({
    where: {
      employeeCode: {
        gte: employeeCode(1),
        lte: employeeCode(EMPLOYEE_COUNT),
      },
    },
  });

  if (existing >= EMPLOYEE_COUNT) {
    console.log(`Employees already seeded (${existing}/${EMPLOYEE_COUNT}), skipping`);
    return existing;
  }

  const existingCodes = new Set(
    (
      await prisma.employee.findMany({
        where: {
          employeeCode: {
            gte: employeeCode(1),
            lte: employeeCode(EMPLOYEE_COUNT),
          },
        },
        select: { employeeCode: true },
      })
    ).map((row) => row.employeeCode)
  );

  console.log(
    `Seeding employees: ${existingCodes.size} present, target ${EMPLOYEE_COUNT}`
  );

  for (let start = 1; start <= EMPLOYEE_COUNT; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE - 1, EMPLOYEE_COUNT);
    const employees: {
      id: string;
      employeeCode: string;
      fullName: string;
      email: string;
      jobTitle: string;
      departmentId: number;
      countryId: number;
      hireDate: Date;
      status: "active";
      createdById: string;
    }[] = [];
    const salaries: {
      id: string;
      employeeId: string;
      amount: number;
      currencyCode: string;
      payPeriod: PayPeriod;
      effectiveFrom: Date;
      effectiveTo: null;
      changeType: "joining";
      changeReason: string;
      changedById: string;
    }[] = [];

    for (let n = start; n <= end; n += 1) {
      const code = employeeCode(n);
      if (existingCodes.has(code)) continue;

      const department = pick(departmentRows, n);
      const country = pick(countryRows, n * 3);
      const meta = countryMeta.get(country.name);
      if (!meta) {
        throw new Error(`Missing country seed meta for ${country.name}`);
      }

      const jobs = DEPARTMENT_JOBS[department.name] || ["Specialist"];
      const first = pick(FIRST_NAMES, n);
      const last = pick(LAST_NAMES, n * 7);
      const id = randomUUID();
      const hireDate = hireDateFor(n);

      employees.push({
        id,
        employeeCode: code,
        fullName: `${first} ${last}`,
        email: `${first}.${last}.${n}@acme.example`.toLowerCase(),
        jobTitle: pick(jobs, n * 11),
        departmentId: department.id,
        countryId: country.id,
        hireDate,
        status: "active",
        createdById,
      });

      salaries.push({
        id: randomUUID(),
        employeeId: id,
        amount: amountFor(meta.minAmount, meta.maxAmount, n),
        currencyCode: country.currencyCode,
        payPeriod: meta.payPeriod,
        effectiveFrom: hireDate,
        effectiveTo: null,
        changeType: "joining",
        changeReason: "Seed joining salary",
        changedById: createdById,
      });
    }

    if (employees.length === 0) continue;

    await prisma.employee.createMany({ data: employees, skipDuplicates: true });
    await prisma.salary.createMany({ data: salaries, skipDuplicates: true });
    console.log(`  seeded batch ${start}-${end} (+${employees.length})`);
  }

  return prisma.employee.count({
    where: {
      employeeCode: {
        gte: employeeCode(1),
        lte: employeeCode(EMPLOYEE_COUNT),
      },
    },
  });
}

async function main() {
  const { user, departmentRows, countryRows, countryMeta } =
    await seedReferenceData();

  const employeeTotal = await seedEmployees(
    user.id,
    departmentRows,
    countryRows,
    countryMeta
  );

  console.log(
    `Seed complete: ${departmentRows.length} departments, ${countryRows.length} countries, ${employeeTotal} employees, HR ${user.email}`
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

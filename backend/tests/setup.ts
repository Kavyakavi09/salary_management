import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { prisma } from "../src/config/db";

const testDbPath = path.join(__dirname, "..", "prisma", "test.db");

beforeAll(() => {
  for (const file of [testDbPath, `${testDbPath}-journal`]) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  }

  execSync("npx prisma db push --schema=prisma/schema.test.prisma", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: "file:./prisma/test.db",
    },
  });
});

afterEach(async () => {
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.hrUser.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

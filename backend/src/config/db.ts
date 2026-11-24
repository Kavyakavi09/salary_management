import { PrismaClient as PostgresPrismaClient } from "@prisma/client";

type AppPrismaClient = PostgresPrismaClient;

const createPrismaClient = (): AppPrismaClient => {
  if (process.env.NODE_ENV === "test") {
    // Generated from prisma/schema.test.prisma (SQLite) — never touches Postgres
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/test-client");
    return new PrismaClient() as AppPrismaClient;
  }

  return new PostgresPrismaClient();
};

const prisma = createPrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log(
      process.env.NODE_ENV === "test"
        ? "Connected to SQLite test database"
        : "Connected to PostgreSQL"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log("Failed to connect to database: ", message);
    process.exit(1);
  }
};

export { prisma, connectDB };
export default connectDB;

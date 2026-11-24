import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log("Failed to connect to PostgreSQL: ", message);
    process.exit(1);
  }
};

export { prisma, connectDB };
export default connectDB;

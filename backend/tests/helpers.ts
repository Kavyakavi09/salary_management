import bcrypt from "bcryptjs";
import { prisma } from "../src/config/db";

export const createHrUser = async ({
  name = "Test HR",
  email = "hr.test@acme.com",
  password = "Password123!",
  role = "hr_admin",
} = {}) => {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.hrUser.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
  });

  return { user, password };
};

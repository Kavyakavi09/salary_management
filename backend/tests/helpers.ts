import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  return { user, password, token };
};

export const createDepartment = async (name = "Engineering") => {
  return prisma.department.create({ data: { name } });
};

export const createEmployee = async ({
  hrUserId,
  departmentId,
  employeeCode = "EMP001",
  fullName = "Ada Lovelace",
  email = "ada@acme.com",
  jobTitle = "Engineer",
  country = "India",
  grossSalary = 50000,
  currencyCode = "INR",
}: {
  hrUserId: string;
  departmentId: number;
  employeeCode?: string;
  fullName?: string;
  email?: string;
  jobTitle?: string;
  country?: string;
  grossSalary?: number;
  currencyCode?: string;
}) => {
  return prisma.employee.create({
    data: {
      employeeCode,
      fullName,
      email,
      jobTitle,
      departmentId,
      country,
      grossSalary,
      currencyCode,
      hireDate: new Date("2024-01-15"),
      createdById: hrUserId,
    },
    include: { department: true },
  });
};

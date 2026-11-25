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

export const createCurrency = async ({
  code = "INR",
  name = "Indian Rupee",
  symbol = "₹",
}: {
  code?: string;
  name?: string;
  symbol?: string;
} = {}) => {
  return prisma.currency.upsert({
    where: { code },
    update: { name, symbol },
    create: { code, name, symbol },
  });
};

export const createDepartment = async (name = "Engineering") => {
  return prisma.department.create({ data: { name } });
};

export const createCountry = async ({
  name = "India",
  currencyCode = "INR",
  tdsRate = 0.2,
}: {
  name?: string;
  currencyCode?: string;
  tdsRate?: number;
} = {}) => {
  await createCurrency({
    code: currencyCode,
    name: currencyCode === "USD" ? "US Dollar" : "Indian Rupee",
    symbol: currencyCode === "USD" ? "$" : "₹",
  });

  return prisma.country.create({
    data: { name, currencyCode, tdsRate },
  });
};

export const createEmployee = async ({
  hrUserId,
  departmentId,
  countryId,
  employeeCode = "EMP001",
  fullName = "Ada Lovelace",
  email = "ada@acme.com",
  jobTitle = "Engineer",
}: {
  hrUserId: string;
  departmentId: number;
  countryId: number;
  employeeCode?: string;
  fullName?: string;
  email?: string;
  jobTitle?: string;
}) => {
  return prisma.employee.create({
    data: {
      employeeCode,
      fullName,
      email,
      jobTitle,
      departmentId,
      countryId,
      hireDate: new Date("2024-01-15"),
      createdById: hrUserId,
    },
    include: { department: true, country: true },
  });
};

export const createSalary = async ({
  employeeId,
  changedById,
  amount = 50000,
  currencyCode = "INR",
  payPeriod = "monthly" as const,
  effectiveFrom = new Date("2024-01-15"),
  changeType = "joining" as const,
  changeReason = null as string | null,
}: {
  employeeId: string;
  changedById: string;
  amount?: number;
  currencyCode?: string;
  payPeriod?: "monthly" | "annual";
  effectiveFrom?: Date;
  changeType?: "joining" | "hike" | "correction";
  changeReason?: string | null;
}) => {
  await createCurrency({
    code: currencyCode,
    name: currencyCode === "USD" ? "US Dollar" : "Indian Rupee",
    symbol: currencyCode === "USD" ? "$" : "₹",
  });

  return prisma.salary.create({
    data: {
      employeeId,
      amount,
      currencyCode,
      payPeriod,
      effectiveFrom,
      effectiveTo: null,
      changeType,
      changeReason,
      changedById,
    },
  });
};

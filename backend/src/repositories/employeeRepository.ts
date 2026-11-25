import { Prisma, EmployeeStatus } from "@prisma/client";
import { prisma } from "../config/db";

export type EmployeeListFilters = {
  search?: string;
  country?: string;
  jobTitle?: string;
  departmentId?: number;
  page: number;
  limit: number;
};

const departmentInclude = {
  department: true,
} satisfies Prisma.EmployeeInclude;

const stringFilter = (value: string): Prisma.StringFilter => {
  if (process.env.NODE_ENV === "test") {
    return { contains: value };
  }
  return { contains: value, mode: "insensitive" };
};

const employeeRepository = {
  findMany(filters: EmployeeListFilters) {
    const where: Prisma.EmployeeWhereInput = {
      deletedAt: null,
      ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
      ...(filters.country
        ? {
            country:
              process.env.NODE_ENV === "test"
                ? filters.country
                : { equals: filters.country, mode: "insensitive" },
          }
        : {}),
      ...(filters.jobTitle
        ? {
            jobTitle:
              process.env.NODE_ENV === "test"
                ? filters.jobTitle
                : { equals: filters.jobTitle, mode: "insensitive" },
          }
        : {}),
      ...(filters.search
        ? {
            OR: [
              { fullName: stringFilter(filters.search) },
              { email: stringFilter(filters.search) },
              { employeeCode: stringFilter(filters.search) },
            ],
          }
        : {}),
    };

    const skip = (filters.page - 1) * filters.limit;

    return prisma.$transaction([
      prisma.employee.findMany({
        where,
        include: departmentInclude,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip,
        take: filters.limit,
      }),
      prisma.employee.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: departmentInclude,
    });
  },

  findByEmail(email: string) {
    return prisma.employee.findFirst({
      where: { email, deletedAt: null },
    });
  },

  findByEmployeeCode(employeeCode: string) {
    return prisma.employee.findFirst({
      where: { employeeCode, deletedAt: null },
    });
  },

  create(data: {
    employeeCode: string;
    fullName: string;
    email: string;
    jobTitle: string;
    departmentId: number;
    country: string;
    grossSalary: Prisma.Decimal | number | string;
    currencyCode: string;
    hireDate: Date;
    createdById: string;
    status?: EmployeeStatus;
  }) {
    return prisma.employee.create({
      data,
      include: departmentInclude,
    });
  },

  update(id: string, data: Prisma.EmployeeUpdateInput) {
    return prisma.employee.update({
      where: { id },
      data,
      include: departmentInclude,
    });
  },

  softDelete(id: string) {
    return prisma.employee.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "inactive",
      },
    });
  },
};

export default employeeRepository;

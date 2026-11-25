import { Prisma, EmployeeStatus } from "@prisma/client";
import { prisma } from "../config/db";

export type EmployeeListFilters = {
  search?: string;
  countryId?: number;
  jobTitle?: string;
  departmentId?: number;
  page: number;
  limit: number;
};

const employeeInclude = {
  department: true,
  country: true,
  salaries: {
    where: { effectiveTo: null },
    take: 1,
    orderBy: { effectiveFrom: "desc" as const },
  },
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
      ...(filters.countryId ? { countryId: filters.countryId } : {}),
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
        include: employeeInclude,
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
      include: employeeInclude,
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
    countryId: number;
    hireDate: Date;
    createdById: string;
    status?: EmployeeStatus;
  }) {
    return prisma.employee.create({
      data,
      include: employeeInclude,
    });
  },

  update(id: string, data: Prisma.EmployeeUpdateInput) {
    return prisma.employee.update({
      where: { id },
      data,
      include: employeeInclude,
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

import { EmployeeStatus } from "@prisma/client";
import AppError from "../utils/AppError";
import employeeRepository from "../repositories/employeeRepository";
import departmentRepository from "../repositories/departmentRepository";
import countryRepository from "../repositories/countryRepository";

const toCurrentSalary = (
  salaries?: Array<{
    id: string;
    amount: { toString(): string };
    currencyCode: string;
    payPeriod: string;
    effectiveFrom: Date;
    changeType: string;
  }>
) => {
  const current = salaries?.[0];
  if (!current) return null;

  return {
    id: current.id,
    amount: current.amount.toString(),
    currencyCode: current.currencyCode,
    payPeriod: current.payPeriod,
    effectiveFrom: current.effectiveFrom,
    changeType: current.changeType,
  };
};

const toEmployeeResponse = (employee: {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  jobTitle: string;
  departmentId: number;
  countryId: number;
  hireDate: Date;
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
  department?: { id: number; name: string } | null;
  country?: {
    id: number;
    name: string;
    currencyCode: string;
    tdsRate: { toString(): string };
  } | null;
  salaries?: Array<{
    id: string;
    amount: { toString(): string };
    currencyCode: string;
    payPeriod: string;
    effectiveFrom: Date;
    changeType: string;
  }>;
}) => ({
  id: employee.id,
  employeeCode: employee.employeeCode,
  fullName: employee.fullName,
  email: employee.email,
  jobTitle: employee.jobTitle,
  departmentId: employee.departmentId,
  department: employee.department
    ? { id: employee.department.id, name: employee.department.name }
    : undefined,
  countryId: employee.countryId,
  country: employee.country
    ? {
        id: employee.country.id,
        name: employee.country.name,
        currencyCode: employee.country.currencyCode,
        tdsRate: employee.country.tdsRate.toString(),
      }
    : undefined,
  currentSalary: toCurrentSalary(employee.salaries),
  hireDate: employee.hireDate,
  status: employee.status,
  createdAt: employee.createdAt,
  updatedAt: employee.updatedAt,
});

const listEmployees = async (query: {
  search?: string;
  countryId?: string;
  jobTitle?: string;
  departmentId?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const departmentId = query.departmentId
    ? Number(query.departmentId)
    : undefined;
  const countryId = query.countryId ? Number(query.countryId) : undefined;

  if (query.departmentId && Number.isNaN(departmentId)) {
    throw new AppError("departmentId must be a number", 400);
  }
  if (query.countryId && Number.isNaN(countryId)) {
    throw new AppError("countryId must be a number", 400);
  }

  const [employees, total] = await employeeRepository.findMany({
    search: query.search?.trim() || undefined,
    countryId,
    jobTitle: query.jobTitle?.trim() || undefined,
    departmentId,
    page,
    limit,
  });

  return {
    data: employees.map(toEmployeeResponse),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getEmployee = async (id: string) => {
  const employee = await employeeRepository.findById(id);
  if (!employee) {
    throw new AppError("Employee not found", 404);
  }
  return toEmployeeResponse(employee);
};

const createEmployee = async (
  body: {
    employeeCode?: string;
    fullName?: string;
    email?: string;
    jobTitle?: string;
    departmentId?: number;
    countryId?: number;
    hireDate?: string;
  },
  createdById: string
) => {
  const {
    employeeCode,
    fullName,
    email,
    jobTitle,
    departmentId,
    countryId,
    hireDate,
  } = body;

  if (
    !employeeCode ||
    !fullName ||
    !email ||
    !jobTitle ||
    departmentId === undefined ||
    countryId === undefined ||
    !hireDate
  ) {
    throw new AppError("All required employee fields must be provided", 400);
  }

  const department = await departmentRepository.findById(Number(departmentId));
  if (!department) {
    throw new AppError("Department not found", 404);
  }

  const country = await countryRepository.findById(Number(countryId));
  if (!country) {
    throw new AppError("Country not found", 404);
  }

  if (await employeeRepository.findByEmail(email)) {
    throw new AppError("Employee with this email already exist", 400);
  }

  if (await employeeRepository.findByEmployeeCode(employeeCode)) {
    throw new AppError("Employee code already exist", 400);
  }

  const employee = await employeeRepository.create({
    employeeCode,
    fullName,
    email,
    jobTitle,
    departmentId: Number(departmentId),
    countryId: Number(countryId),
    hireDate: new Date(hireDate),
    createdById,
  });

  return toEmployeeResponse(employee);
};

const updateEmployee = async (
  id: string,
  body: {
    fullName?: string;
    email?: string;
    jobTitle?: string;
    departmentId?: number;
    countryId?: number;
    hireDate?: string;
    status?: EmployeeStatus;
  }
) => {
  const existing = await employeeRepository.findById(id);
  if (!existing) {
    throw new AppError("Employee not found", 404);
  }

  if (body.email && body.email !== existing.email) {
    const emailTaken = await employeeRepository.findByEmail(body.email);
    if (emailTaken) {
      throw new AppError("Employee with this email already exist", 400);
    }
  }

  if (body.departmentId !== undefined) {
    const department = await departmentRepository.findById(
      Number(body.departmentId)
    );
    if (!department) {
      throw new AppError("Department not found", 404);
    }
  }

  if (body.countryId !== undefined) {
    const country = await countryRepository.findById(Number(body.countryId));
    if (!country) {
      throw new AppError("Country not found", 404);
    }
  }

  if (body.status && !["active", "inactive"].includes(body.status)) {
    throw new AppError("status must be active or inactive", 400);
  }

  const updated = await employeeRepository.update(id, {
    ...(body.fullName !== undefined ? { fullName: body.fullName } : {}),
    ...(body.email !== undefined ? { email: body.email } : {}),
    ...(body.jobTitle !== undefined ? { jobTitle: body.jobTitle } : {}),
    ...(body.departmentId !== undefined
      ? { department: { connect: { id: Number(body.departmentId) } } }
      : {}),
    ...(body.countryId !== undefined
      ? { country: { connect: { id: Number(body.countryId) } } }
      : {}),
    ...(body.hireDate !== undefined
      ? { hireDate: new Date(body.hireDate) }
      : {}),
    ...(body.status !== undefined ? { status: body.status } : {}),
  });

  return toEmployeeResponse(updated);
};

const deleteEmployee = async (id: string) => {
  const existing = await employeeRepository.findById(id);
  if (!existing) {
    throw new AppError("Employee not found", 404);
  }

  await employeeRepository.softDelete(id);
  return { id };
};

export default {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};

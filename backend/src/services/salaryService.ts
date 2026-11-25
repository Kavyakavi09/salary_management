import { PayPeriod, SalaryChangeType } from "@prisma/client";
import AppError from "../utils/AppError";
import employeeRepository from "../repositories/employeeRepository";
import salaryRepository from "../repositories/salaryRepository";
import currencyRepository from "../repositories/currencyRepository";

const toSalaryResponse = (salary: {
  id: string;
  employeeId: string;
  amount: { toString(): string };
  currencyCode: string;
  payPeriod: PayPeriod;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  changeType: SalaryChangeType;
  changeReason: string | null;
  changedById: string;
  createdAt: Date;
}) => ({
  id: salary.id,
  employeeId: salary.employeeId,
  amount: salary.amount.toString(),
  currencyCode: salary.currencyCode,
  payPeriod: salary.payPeriod,
  effectiveFrom: salary.effectiveFrom,
  effectiveTo: salary.effectiveTo,
  changeType: salary.changeType,
  changeReason: salary.changeReason,
  changedById: salary.changedById,
  createdAt: salary.createdAt,
  isCurrent: salary.effectiveTo === null,
});

const dayBefore = (date: Date) => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() - 1);
  return d;
};

const listSalaries = async (employeeId: string) => {
  const employee = await employeeRepository.findById(employeeId);
  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  const salaries = await salaryRepository.findByEmployee(employeeId);
  return salaries.map(toSalaryResponse);
};

const setSalary = async (
  employeeId: string,
  body: {
    amount?: number;
    currencyCode?: string;
    payPeriod?: PayPeriod;
    effectiveFrom?: string;
    changeType?: SalaryChangeType;
    changeReason?: string;
  },
  changedById: string
) => {
  const employee = await employeeRepository.findById(employeeId);
  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  const {
    amount,
    currencyCode,
    payPeriod,
    effectiveFrom,
    changeType,
    changeReason,
  } = body;

  if (amount === undefined || !payPeriod || !effectiveFrom || !changeType) {
    throw new AppError(
      "amount, payPeriod, effectiveFrom and changeType are required",
      400
    );
  }

  if (Number(amount) <= 0) {
    throw new AppError("amount must be greater than 0", 400);
  }

  if (!["monthly", "annual"].includes(payPeriod)) {
    throw new AppError("payPeriod must be monthly or annual", 400);
  }

  if (!["joining", "hike", "correction"].includes(changeType)) {
    throw new AppError(
      "changeType must be joining, hike, or correction",
      400
    );
  }

  const resolvedCurrency = (
    currencyCode?.trim().toUpperCase() || employee.country.currencyCode
  ).toUpperCase();

  const currency = await currencyRepository.findByCode(resolvedCurrency);
  if (!currency) {
    throw new AppError("Currency not found", 404);
  }

  const fromDate = new Date(effectiveFrom);
  if (Number.isNaN(fromDate.getTime())) {
    throw new AppError("effectiveFrom must be a valid date", 400);
  }

  const current = await salaryRepository.findCurrent(employeeId);

  if (!current && changeType !== "joining") {
    throw new AppError(
      "First salary for an employee must use changeType joining",
      400
    );
  }

  if (current && changeType === "joining") {
    throw new AppError(
      "Employee already has a salary; use hike or correction",
      400
    );
  }

  if (current && fromDate <= current.effectiveFrom) {
    throw new AppError(
      "effectiveFrom must be after the current salary start date",
      400
    );
  }

  const salary = await salaryRepository.reviseInTransaction({
    currentId: current?.id ?? null,
    closeDate: current ? dayBefore(fromDate) : null,
    next: {
      employeeId,
      amount,
      currencyCode: resolvedCurrency,
      payPeriod,
      effectiveFrom: fromDate,
      changeType,
      changeReason: changeReason?.trim() || null,
      changedById,
    },
  });

  return toSalaryResponse(salary);
};

export default {
  listSalaries,
  setSalary,
  toSalaryResponse,
};

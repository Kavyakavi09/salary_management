import AppError from "../utils/AppError";
import { calculateNetSalary } from "../utils/salaryCalc";
import employeeRepository from "../repositories/employeeRepository";
import countryRepository from "../repositories/countryRepository";
import salaryRepository from "../repositories/salaryRepository";

const calculate = async (body: {
  employeeId?: string;
  grossSalary?: number;
  countryId?: number;
}) => {
  // Mode 1: current salary on employee + country TDS
  if (body.employeeId) {
    const employee = await employeeRepository.findById(body.employeeId);
    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    const current = await salaryRepository.findCurrent(employee.id);
    if (!current) {
      throw new AppError("Employee has no current salary", 400);
    }

    const pay = calculateNetSalary(
      current.amount.toString(),
      employee.country.tdsRate.toString()
    );

    return {
      employeeId: employee.id,
      salaryId: current.id,
      countryId: employee.countryId,
      country: employee.country.name,
      currencyCode: current.currencyCode,
      payPeriod: current.payPeriod,
      ...pay,
    };
  }

  // Mode 2: ad-hoc gross + country TDS
  if (body.grossSalary === undefined || body.countryId === undefined) {
    throw new AppError(
      "Provide employeeId, or both grossSalary and countryId",
      400
    );
  }

  if (Number(body.grossSalary) <= 0) {
    throw new AppError("grossSalary must be greater than 0", 400);
  }

  const country = await countryRepository.findById(Number(body.countryId));
  if (!country) {
    throw new AppError("Country not found", 404);
  }

  const pay = calculateNetSalary(body.grossSalary, country.tdsRate.toString());

  return {
    countryId: country.id,
    country: country.name,
    currencyCode: country.currencyCode,
    ...pay,
  };
};

export default { calculate };

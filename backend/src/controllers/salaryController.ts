import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import salaryService from "../services/salaryService";

const paramEmployeeId = (req: Request) => String(req.params.id);

const listEmployeeSalaries = asyncHandler(async (req: Request, res: Response) => {
  const data = await salaryService.listSalaries(paramEmployeeId(req));

  res.status(200).json({
    success: true,
    message: "Salaries fetched successfully",
    data,
  });
});

const setEmployeeSalary = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Access denied", 401);
  }

  const data = await salaryService.setSalary(
    paramEmployeeId(req),
    req.body,
    req.user.id
  );

  res.status(201).json({
    success: true,
    message: "Salary saved successfully",
    data,
  });
});

export { listEmployeeSalaries, setEmployeeSalary };

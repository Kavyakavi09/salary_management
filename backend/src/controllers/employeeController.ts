import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import employeeService from "../services/employeeService";

const paramId = (req: Request) => String(req.params.id);

const listEmployees = asyncHandler(async (req: Request, res: Response) => {
  const result = await employeeService.listEmployees({
    search: req.query.search as string | undefined,
    countryId: req.query.countryId as string | undefined,
    jobTitle: req.query.jobTitle as string | undefined,
    departmentId: req.query.departmentId as string | undefined,
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
  });

  res.status(200).json({
    success: true,
    message: "Employees fetched successfully",
    ...result,
  });
});

const getEmployee = asyncHandler(async (req: Request, res: Response) => {
  const employee = await employeeService.getEmployee(paramId(req));

  res.status(200).json({
    success: true,
    message: "Employee fetched successfully",
    data: employee,
  });
});

const createEmployee = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Access denied", 401);
  }

  const employee = await employeeService.createEmployee(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: "Employee created successfully",
    data: employee,
  });
});

const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
  const employee = await employeeService.updateEmployee(paramId(req), req.body);

  res.status(200).json({
    success: true,
    message: "Employee updated successfully",
    data: employee,
  });
});

const deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
  const result = await employeeService.deleteEmployee(paramId(req));

  res.status(200).json({
    success: true,
    message: "Employee deleted successfully",
    data: result,
  });
});

export {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};

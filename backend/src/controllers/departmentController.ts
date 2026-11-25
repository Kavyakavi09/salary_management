import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import departmentService from "../services/departmentService";

const paramId = (req: Request) => Number(req.params.id);

const listDepartments = asyncHandler(async (_req: Request, res: Response) => {
  const data = await departmentService.listDepartments();

  res.status(200).json({
    success: true,
    message: "Departments fetched successfully",
    data,
  });
});

const getDepartment = asyncHandler(async (req: Request, res: Response) => {
  const id = paramId(req);
  if (Number.isNaN(id)) {
    throw new AppError("Invalid department id", 400);
  }

  const data = await departmentService.getDepartment(id);

  res.status(200).json({
    success: true,
    message: "Department fetched successfully",
    data,
  });
});

const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const data = await departmentService.createDepartment(req.body.name);

  res.status(201).json({
    success: true,
    message: "Department created successfully",
    data,
  });
});

const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const id = paramId(req);
  if (Number.isNaN(id)) {
    throw new AppError("Invalid department id", 400);
  }

  const data = await departmentService.updateDepartment(id, req.body.name);

  res.status(200).json({
    success: true,
    message: "Department updated successfully",
    data,
  });
});

const deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
  const id = paramId(req);
  if (Number.isNaN(id)) {
    throw new AppError("Invalid department id", 400);
  }

  const data = await departmentService.deleteDepartment(id);

  res.status(200).json({
    success: true,
    message: "Department deleted successfully",
    data,
  });
});

export {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};

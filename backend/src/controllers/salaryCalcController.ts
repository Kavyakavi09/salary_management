import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import salaryCalcService from "../services/salaryCalcService";

const calculateSalary = asyncHandler(async (req: Request, res: Response) => {
  const data = await salaryCalcService.calculate(req.body);

  res.status(200).json({
    success: true,
    message: "Salary calculated successfully",
    data,
  });
});

export { calculateSalary };

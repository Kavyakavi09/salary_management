import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import analyticsService from "../services/analyticsService";

const byCountry = asyncHandler(async (req: Request, res: Response) => {
  const data = await analyticsService.metricsByCountry({
    countryId: req.query.countryId as string | undefined,
    currencyCode: req.query.currencyCode as string | undefined,
    payPeriod: req.query.payPeriod as string | undefined,
  });

  res.status(200).json({
    success: true,
    message: "Salary metrics by country fetched successfully",
    data,
  });
});

const byJobTitle = asyncHandler(async (req: Request, res: Response) => {
  const data = await analyticsService.metricsByJobTitle({
    countryId: req.query.countryId as string | undefined,
    jobTitle: req.query.jobTitle as string | undefined,
    currencyCode: req.query.currencyCode as string | undefined,
    payPeriod: req.query.payPeriod as string | undefined,
  });

  res.status(200).json({
    success: true,
    message: "Salary metrics by job title fetched successfully",
    data,
  });
});

export { byCountry, byJobTitle };

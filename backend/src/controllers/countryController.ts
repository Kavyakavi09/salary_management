import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import countryService from "../services/countryService";

const paramId = (req: Request) => Number(req.params.id);

const listCountries = asyncHandler(async (_req: Request, res: Response) => {
  const data = await countryService.listCountries();

  res.status(200).json({
    success: true,
    message: "Countries fetched successfully",
    data,
  });
});

const getCountry = asyncHandler(async (req: Request, res: Response) => {
  const id = paramId(req);
  if (Number.isNaN(id)) {
    throw new AppError("Invalid country id", 400);
  }

  const data = await countryService.getCountry(id);

  res.status(200).json({
    success: true,
    message: "Country fetched successfully",
    data,
  });
});

const createCountry = asyncHandler(async (req: Request, res: Response) => {
  const data = await countryService.createCountry(req.body);

  res.status(201).json({
    success: true,
    message: "Country created successfully",
    data,
  });
});

const updateCountry = asyncHandler(async (req: Request, res: Response) => {
  const id = paramId(req);
  if (Number.isNaN(id)) {
    throw new AppError("Invalid country id", 400);
  }

  const data = await countryService.updateCountry(id, req.body);

  res.status(200).json({
    success: true,
    message: "Country updated successfully",
    data,
  });
});

const deleteCountry = asyncHandler(async (req: Request, res: Response) => {
  const id = paramId(req);
  if (Number.isNaN(id)) {
    throw new AppError("Invalid country id", 400);
  }

  const data = await countryService.deleteCountry(id);

  res.status(200).json({
    success: true,
    message: "Country deleted successfully",
    data,
  });
});

export {
  listCountries,
  getCountry,
  createCountry,
  updateCountry,
  deleteCountry,
};

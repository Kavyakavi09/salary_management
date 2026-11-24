import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

const errorHandler = (
  err: Error & { statusCode?: number; isOperational?: boolean },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err.isOperational) {
    return res.status(err.statusCode ?? 400).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Oops, Something went wrong",
  });
};

const notFound = (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError("Route not found", 404));
};

export { notFound, errorHandler };

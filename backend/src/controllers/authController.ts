import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import authService from "../services/authService";

const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const user = await authService.register(name, email, password);

  res.status(201).json({
    success: true,
    message: "User created",
    data: user,
  });
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.status(200).json({
    success: true,
    message: "Login successfully",
    data: result.user,
    token: result.token,
  });
});

const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Access denied", 401);
  }

  const user = await authService.getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});

export { register, login, getCurrentUser };

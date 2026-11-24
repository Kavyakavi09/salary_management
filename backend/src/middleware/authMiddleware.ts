import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthPayload = {
  id: string;
  name: string;
  email: string;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied, No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthPayload;

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Access denied",
    });
  }
};

const authorizationRoles =
  (...allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };

export { authMiddleware, authorizationRoles };

import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRoute = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

const asyncHandler =
  (fn: AsyncRoute): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

export default asyncHandler;

import { Router } from "express";
import { calculateSalary } from "../controllers/salaryCalcController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/calculate", calculateSalary);

export default router;

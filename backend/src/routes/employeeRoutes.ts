import { Router } from "express";
import {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController";
import {
  listEmployeeSalaries,
  setEmployeeSalary,
} from "../controllers/salaryController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", listEmployees);
router.post("/", createEmployee);
router.get("/:id/salaries", listEmployeeSalaries);
router.post("/:id/salary", setEmployeeSalary);
router.get("/:id", getEmployee);
router.patch("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;

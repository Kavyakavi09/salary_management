import { Router } from "express";
import {
  register,
  login,
  getCurrentUser,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/current-user", authMiddleware, getCurrentUser);

export default router;

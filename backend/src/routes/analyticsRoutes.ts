import { Router } from "express";
import { byCountry, byJobTitle } from "../controllers/analyticsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/by-country", byCountry);
router.get("/by-job-title", byJobTitle);

export default router;

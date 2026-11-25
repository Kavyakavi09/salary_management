import { Router } from "express";
import {
  listCountries,
  getCountry,
  createCountry,
  updateCountry,
  deleteCountry,
} from "../controllers/countryController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", listCountries);
router.post("/", createCountry);
router.get("/:id", getCountry);
router.patch("/:id", updateCountry);
router.delete("/:id", deleteCountry);

export default router;

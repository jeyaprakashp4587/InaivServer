import express from "express";
const router = express.Router();
import {
  getAllPreparations,
  getPreparationData,
} from "../Controllers/prepController.js";

router.get("/getAllPreparations", getAllPreparations);
router.post("/getParticularPreparation", getPreparationData);

export default router;

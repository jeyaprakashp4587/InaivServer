import express from "express";
import {
  getAllPreparations,
  getPreparationData,
} from "../Controllers/preparationController.js";

const router = express.Router();
router.get("/getAllPreparations", getAllPreparations);
router.post("/getPreparationData", getPreparationData);

export default router;

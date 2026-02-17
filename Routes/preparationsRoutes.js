import express from "express";
import { getAllPreparations } from "../Controllers/preparationController.js";

const router = express.Router();
router.get("/getAllPreparations", getAllPreparations);

export default router;

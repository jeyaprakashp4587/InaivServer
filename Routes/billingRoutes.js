import express from "express";
import {
  getCreditTransactions,
  getOverview,
  getPlans,
  subscribeToPlan,
} from "../Controllers/billingController.js";

const router = express.Router();

router.get("/plans", getPlans);
router.get("/overview", getOverview);
router.post("/subscribe", subscribeToPlan);
router.get("/credits/history", getCreditTransactions);

export default router;

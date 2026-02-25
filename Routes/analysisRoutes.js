import express from "express";
import {
  analyzeSaas,
  getSaasAnalysisById,
  listSaasAnalyses,
} from "../Controllers/analysisController.js";

const router = express.Router();

router.post("/saas", analyzeSaas);
router.get("/history", listSaasAnalyses);
router.get("/:analysisId", getSaasAnalysisById);

export default router;

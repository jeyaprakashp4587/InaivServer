import SaasAnalysis from "../Models/SaasAnalysis.js";
import {
  calculateAnalysisCredits,
  calculateWalletSummary,
  debitCredits,
  ensureUserBillingSetup,
} from "../Services/billingService.js";
import { runSaasGptPipeline } from "../Utils/GPTAI/saasAnalysisPipeline.js";

const handleError = (res, error) => {
  const statusCode = error?.statusCode || 500;
  return res.status(statusCode).json({
    error: error?.message || "Internal server error",
    details: error?.details,
  });
};

export const analyzeSaas = async (req, res) => {
  const userId = req.userId;
  const {
    productUrl,
    productDescription = "",
    selectedFeatureIds = [],
  } = req.body || {};

  if (!productUrl || typeof productUrl !== "string") {
    return res.status(400).json({ error: "productUrl is required" });
  }

  try {
    const { selectedModules, totalCredits } = calculateAnalysisCredits(selectedFeatureIds);
    const { wallet } = await ensureUserBillingSetup(userId);
    const walletBefore = calculateWalletSummary(wallet);

    if (walletBefore.remainingCredits < totalCredits) {
      return res.status(402).json({
        error: "Insufficient credits for this analysis",
        details: {
          requiredCredits: totalCredits,
          remainingCredits: walletBefore.remainingCredits,
        },
      });
    }

    const aiResponse = await runSaasGptPipeline({
      productUrl,
      productDescription,
      selectedModules,
    });

    const debited = await debitCredits({
      userId,
      amount: totalCredits,
      reason: "saas_analysis",
      metadata: {
        productUrl,
        selectedFeatureIds,
        selectedFeatureNames: selectedModules.map((item) => item.name),
      },
    });

    const analysis = await SaasAnalysis.create({
      userId,
      productUrl,
      productDescription,
      selectedFeatureIds,
      selectedFeatures: selectedModules.map((item) => item.name),
      creditsCharged: totalCredits,
      status: "success",
      model: aiResponse.model,
      promptVersion: "v1",
      usage: aiResponse.usage,
      result: aiResponse.result,
    });

    return res.status(201).json({
      analysis: {
        id: analysis._id,
        result: analysis.result,
        selectedFeatureIds,
        selectedFeatures: analysis.selectedFeatures,
        creditsCharged: analysis.creditsCharged,
        createdAt: analysis.createdAt,
      },
      credits: debited.summary,
    });
  } catch (error) {
    try {
      await SaasAnalysis.create({
        userId,
        productUrl,
        productDescription,
        selectedFeatureIds,
        selectedFeatures: [],
        creditsCharged: 0,
        status: "failed",
        model: "",
        usage: {},
        result: {},
        errorMessage: error?.message || "analysis failed",
      });
    } catch (_persistError) {
      // Ignore persistence errors for failed-analysis logging.
    }

    return handleError(res, error);
  }
};

export const listSaasAnalyses = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10);
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 10;

    const analyses = await SaasAnalysis.find({ userId: req.userId, status: "success" })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .select(
        "_id productUrl selectedFeatures creditsCharged createdAt result.competitors result.comparison",
      )
      .lean();

    return res.status(200).json({ analyses });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getSaasAnalysisById = async (req, res) => {
  try {
    const analysis = await SaasAnalysis.findOne({
      _id: req.params.analysisId,
      userId: req.userId,
      status: "success",
    }).lean();

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    return res.status(200).json({ analysis });
  } catch (error) {
    return handleError(res, error);
  }
};

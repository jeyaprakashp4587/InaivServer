import Payment from "../Models/Payment.js";
import { getBillingOverview, switchUserPlan } from "../Services/billingService.js";
import {
  computePlanAmount,
  confirmPaymentRecord,
  createPaymentRecord,
  getPaymentHistory,
  resolvePlanForPayment,
} from "../Services/paymentService.js";

const handleError = (res, error) => {
  const statusCode = error?.statusCode || 500;
  return res.status(statusCode).json({
    error: error?.message || "Internal server error",
    details: error?.details,
  });
};

export const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.userId;
    const { planKey, billingCycle = "monthly", paymentMethod } = req.body || {};

    if (!planKey) {
      return res.status(400).json({ error: "planKey is required" });
    }

    const plan = await resolvePlanForPayment(planKey);
    const amount = computePlanAmount(plan, billingCycle);

    if (amount <= 0) {
      return res.status(400).json({
        error:
          "Selected plan is free and does not require a payment intent. Use /billing/subscribe instead.",
      });
    }

    const payment = await createPaymentRecord({
      userId,
      plan,
      billingCycle,
      paymentMethod,
      status: "pending",
      provider: "manual",
      providerReference: `intent_${Date.now()}`,
    });

    return res.status(201).json({
      payment,
      clientSecret: `mock_client_secret_${payment._id}`,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      paymentId,
      success = true,
      activateSubscription = true,
      providerReference,
      paymentMethod,
    } = req.body || {};

    if (!paymentId) {
      return res.status(400).json({ error: "paymentId is required" });
    }

    const payment = await Payment.findOne({ _id: paymentId, userId });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const confirmed = await confirmPaymentRecord({
      paymentId,
      success,
      providerReference,
    });

    let overview = null;

    if (success && activateSubscription) {
      const switched = await switchUserPlan({
        userId,
        planKey: confirmed.planKey,
        billingCycle: confirmed.billingCycle,
        paymentMethod: paymentMethod || confirmed.metadata?.paymentMethod,
        lastPaymentId: confirmed._id,
      });

      confirmed.subscriptionId = switched.subscription._id;
      await confirmed.save();
      overview = await getBillingOverview(userId);
    }

    return res.status(200).json({
      payment: confirmed,
      overview,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const listPayments = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 20;

    const payments = await getPaymentHistory({ userId: req.userId, limit: safeLimit });

    return res.status(200).json({ payments });
  } catch (error) {
    return handleError(res, error);
  }
};

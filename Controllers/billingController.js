import CreditTransaction from "../Models/CreditTransaction.js";
import {
  getActivePlans,
  getBillingOverview,
  switchUserPlan,
} from "../Services/billingService.js";
import {
  createPaymentRecord,
  resolvePlanForPayment,
} from "../Services/paymentService.js";

const handleError = (res, error) => {
  const statusCode = error?.statusCode || 500;
  return res.status(statusCode).json({
    error: error?.message || "Internal server error",
    details: error?.details,
  });
};

export const getPlans = async (_req, res) => {
  try {
    const plans = await getActivePlans();

    return res.status(200).json({
      plans: plans.map((plan) => ({
        key: plan.key,
        name: plan.name,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        monthlyCredits: plan.monthlyCredits,
        features: plan.features,
      })),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getOverview = async (req, res) => {
  try {
    const overview = await getBillingOverview(req.userId);

    return res.status(200).json(overview);
  } catch (error) {
    return handleError(res, error);
  }
};

export const subscribeToPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { planKey, billingCycle = "monthly", paymentMethod } = req.body || {};

    const plan = await resolvePlanForPayment(planKey);
    const amount = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

    let payment = null;

    if (amount > 0) {
      if (!paymentMethod?.last4 || !paymentMethod?.brand) {
        return res.status(400).json({
          error:
            "paymentMethod (brand + last4) is required for paid plans in this controller",
        });
      }

      payment = await createPaymentRecord({
        userId,
        plan,
        billingCycle,
        paymentMethod,
        status: "paid",
        provider: "manual",
        providerReference: `manual_${Date.now()}`,
      });
    }

    const switched = await switchUserPlan({
      userId,
      planKey: plan.key,
      billingCycle,
      paymentMethod,
      lastPaymentId: payment?._id || null,
    });

    if (payment) {
      payment.subscriptionId = switched.subscription._id;
      await payment.save();
    }

    const overview = await getBillingOverview(userId);

    return res.status(200).json({
      message: `Plan switched to ${switched.plan.name}`,
      payment,
      overview,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getCreditTransactions = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 50);
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50;

    const transactions = await CreditTransaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean();

    return res.status(200).json({ transactions });
  } catch (error) {
    return handleError(res, error);
  }
};

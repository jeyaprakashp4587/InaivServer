import Plan from "../Models/Plan.js";
import Payment from "../Models/Payment.js";
import { addBillingPeriod } from "./billingService.js";

const createInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const millis = String(now.getTime()).slice(-8);
  const random = Math.floor(Math.random() * 900) + 100;
  return `INV-${year}-${millis}-${random}`;
};

export const resolvePlanForPayment = async (planKey) => {
  const normalizedPlanKey = String(planKey || "").toLowerCase();
  const plan = await Plan.findOne({ key: normalizedPlanKey, isActive: true });

  if (!plan) {
    const err = new Error("Plan not found");
    err.statusCode = 404;
    throw err;
  }

  return plan;
};

export const computePlanAmount = (plan, billingCycle = "monthly") => {
  const normalizedBillingCycle = String(billingCycle || "monthly").toLowerCase();
  return normalizedBillingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
};

export const createPaymentRecord = async ({
  userId,
  plan,
  billingCycle = "monthly",
  subscriptionId = null,
  paymentMethod,
  status = "pending",
  provider = "manual",
  providerReference = "",
}) => {
  const now = new Date();
  const periodEnd = addBillingPeriod(now, billingCycle);
  const amount = computePlanAmount(plan, billingCycle);

  const payment = await Payment.create({
    userId,
    subscriptionId,
    planId: plan._id,
    planKey: plan.key,
    billingCycle,
    amount,
    currency: "USD",
    status,
    provider,
    providerReference,
    invoiceNumber: createInvoiceNumber(),
    periodStart: now,
    periodEnd,
    paidAt: status === "paid" ? now : null,
    failedAt: status === "failed" ? now : null,
    metadata: {
      paymentMethod,
    },
  });

  return payment;
};

export const confirmPaymentRecord = async ({ paymentId, success = true, providerReference }) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    const err = new Error("Payment not found");
    err.statusCode = 404;
    throw err;
  }

  payment.status = success ? "paid" : "failed";
  payment.providerReference = providerReference || payment.providerReference;

  if (success) {
    payment.paidAt = new Date();
    payment.failedAt = null;
  } else {
    payment.failedAt = new Date();
    payment.paidAt = null;
  }

  await payment.save();

  return payment;
};

export const getPaymentHistory = async ({ userId, limit = 20 }) => {
  return Payment.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

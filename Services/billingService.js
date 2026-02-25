import Plan from "../Models/Plan.js";
import UserSubscription from "../Models/UserSubscription.js";
import CreditWallet from "../Models/CreditWallet.js";
import CreditTransaction from "../Models/CreditTransaction.js";
import {
  FEATURE_MODULES,
  FEATURE_MODULES_BY_ID,
  PLAN_CATALOG,
  VALID_BILLING_CYCLES,
} from "../Utils/billing/catalog.js";

export const addBillingPeriod = (baseDate, billingCycle = "monthly") => {
  const next = new Date(baseDate);
  if (billingCycle === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
};

export const calculateWalletSummary = (walletDoc) => {
  const monthlyAllowance = walletDoc?.monthlyAllowance || 0;
  const bonusCredits = walletDoc?.bonusCredits || 0;
  const totalCredits = monthlyAllowance + bonusCredits;
  const usedCredits = Math.min(walletDoc?.usedCredits || 0, totalCredits);
  const remainingCredits = Math.max(totalCredits - usedCredits, 0);
  const usagePercent = totalCredits
    ? Math.min(100, Math.round((usedCredits / totalCredits) * 100))
    : 0;

  return {
    monthlyAllowance,
    bonusCredits,
    usedCredits,
    totalCredits,
    remainingCredits,
    usagePercent,
    lifetimeUsedCredits: walletDoc?.lifetimeUsedCredits || 0,
    lastResetAt: walletDoc?.lastResetAt || null,
    nextResetAt: walletDoc?.nextResetAt || null,
  };
};

export const ensureDefaultPlans = async () => {
  const bulkOps = PLAN_CATALOG.map((plan) => ({
    updateOne: {
      filter: { key: plan.key },
      update: {
        $set: {
          name: plan.name,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          monthlyCredits: plan.monthlyCredits,
          features: plan.features,
          isActive: true,
        },
      },
      upsert: true,
    },
  }));

  if (bulkOps.length > 0) {
    await Plan.bulkWrite(bulkOps);
  }

  return Plan.find({ isActive: true }).sort({ monthlyPrice: 1 });
};

const syncSubscriptionPeriod = async (subscription) => {
  if (!subscription || subscription.status !== "active" || !subscription.autoRenew) {
    return subscription;
  }

  const now = new Date();
  if (subscription.currentPeriodEnd > now) {
    return subscription;
  }

  let currentStart = new Date(subscription.currentPeriodStart);
  let currentEnd = new Date(subscription.currentPeriodEnd);

  while (currentEnd <= now) {
    currentStart = new Date(currentEnd);
    currentEnd = addBillingPeriod(currentEnd, subscription.billingCycle);
  }

  subscription.currentPeriodStart = currentStart;
  subscription.currentPeriodEnd = currentEnd;
  await subscription.save();

  return subscription;
};

const syncWalletCycle = async ({ wallet, subscription, plan }) => {
  if (!wallet || !subscription || !plan) {
    return wallet;
  }

  const now = new Date();
  const currentPlanCredits = plan.monthlyCredits;

  if (!wallet.nextResetAt || wallet.nextResetAt <= now) {
    wallet.monthlyAllowance = currentPlanCredits;
    wallet.usedCredits = 0;
    wallet.lastResetAt = now;

    let nextResetAt = wallet.nextResetAt
      ? new Date(wallet.nextResetAt)
      : new Date(subscription.currentPeriodEnd);

    if (!(nextResetAt instanceof Date) || Number.isNaN(nextResetAt.getTime())) {
      nextResetAt = new Date(subscription.currentPeriodEnd);
    }

    while (nextResetAt <= now) {
      nextResetAt = addBillingPeriod(nextResetAt, subscription.billingCycle);
    }

    wallet.nextResetAt = nextResetAt;
    await wallet.save();
  } else if (wallet.monthlyAllowance !== currentPlanCredits) {
    wallet.monthlyAllowance = currentPlanCredits;
    await wallet.save();
  }

  return wallet;
};

export const ensureUserBillingSetup = async (userId) => {
  await ensureDefaultPlans();

  let [subscription, wallet] = await Promise.all([
    UserSubscription.findOne({ userId }),
    CreditWallet.findOne({ userId }),
  ]);

  if (!subscription) {
    const freePlan = await Plan.findOne({ key: "free" });
    const now = new Date();
    const nextPeriodEnd = addBillingPeriod(now, "monthly");

    subscription = await UserSubscription.create({
      userId,
      planId: freePlan._id,
      planKey: freePlan.key,
      status: "active",
      billingCycle: "monthly",
      currentPeriodStart: now,
      currentPeriodEnd: nextPeriodEnd,
      autoRenew: true,
      cancelAtPeriodEnd: false,
      paymentMethod: {},
    });

    if (!wallet) {
      wallet = await CreditWallet.create({
        userId,
        monthlyAllowance: freePlan.monthlyCredits,
        bonusCredits: 0,
        usedCredits: 0,
        lifetimeUsedCredits: 0,
        lastResetAt: now,
        nextResetAt: nextPeriodEnd,
      });
    }

    return { subscription, wallet, plan: freePlan };
  }

  subscription = await syncSubscriptionPeriod(subscription);

  let plan = await Plan.findOne({ _id: subscription.planId });

  if (!plan) {
    plan = await Plan.findOne({ key: "free" });
    if (plan) {
      const now = new Date();
      subscription.planId = plan._id;
      subscription.planKey = plan.key;
      subscription.billingCycle = "monthly";
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = addBillingPeriod(now, "monthly");
      subscription.status = "active";
      await subscription.save();
    }
  }

  if (!wallet) {
    const now = new Date();
    wallet = await CreditWallet.create({
      userId,
      monthlyAllowance: plan?.monthlyCredits || 0,
      bonusCredits: 0,
      usedCredits: 0,
      lifetimeUsedCredits: 0,
      lastResetAt: now,
      nextResetAt: subscription.currentPeriodEnd || addBillingPeriod(now),
    });
  }

  wallet = await syncWalletCycle({ wallet, subscription, plan });

  return { subscription, wallet, plan };
};

export const getActivePlans = async () => {
  await ensureDefaultPlans();
  return Plan.find({ isActive: true }).sort({ monthlyPrice: 1 });
};

export const getFeatureSelections = (selectedFeatureIds = []) => {
  const uniqueIds = [...new Set((selectedFeatureIds || []).map(Number))].filter(
    (id) => Number.isInteger(id),
  );

  const selectedModules = uniqueIds.map((id) => FEATURE_MODULES_BY_ID[id]).filter(Boolean);

  if (!selectedModules.length) {
    const err = new Error("At least one analysis module must be selected");
    err.statusCode = 400;
    throw err;
  }

  if (selectedModules.length !== uniqueIds.length) {
    const invalidIds = uniqueIds.filter((id) => !FEATURE_MODULES_BY_ID[id]);
    const err = new Error(`Invalid analysis module id(s): ${invalidIds.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  return selectedModules;
};

export const calculateAnalysisCredits = (selectedFeatureIds = []) => {
  const selectedModules = getFeatureSelections(selectedFeatureIds);
  const totalCredits = selectedModules.reduce((sum, item) => sum + item.credits, 0);

  return {
    selectedModules,
    totalCredits,
  };
};

export const debitCredits = async ({ userId, amount, reason, metadata = {} }) => {
  const wallet = await CreditWallet.findOne({ userId });
  if (!wallet) {
    const err = new Error("Credit wallet not found");
    err.statusCode = 404;
    throw err;
  }

  const summary = calculateWalletSummary(wallet);

  if (summary.remainingCredits < amount) {
    const err = new Error("Insufficient credits for this analysis");
    err.statusCode = 402;
    err.details = {
      requiredCredits: amount,
      remainingCredits: summary.remainingCredits,
    };
    throw err;
  }

  wallet.usedCredits += amount;
  wallet.lifetimeUsedCredits += amount;
  await wallet.save();

  const updatedSummary = calculateWalletSummary(wallet);

  await CreditTransaction.create({
    userId,
    type: "debit",
    amount,
    reason,
    balanceAfter: updatedSummary.remainingCredits,
    metadata,
  });

  return {
    wallet,
    summary: updatedSummary,
  };
};

export const creditBonus = async ({ userId, amount, reason, metadata = {} }) => {
  const wallet = await CreditWallet.findOne({ userId });
  if (!wallet) {
    const err = new Error("Credit wallet not found");
    err.statusCode = 404;
    throw err;
  }

  wallet.bonusCredits += amount;
  await wallet.save();

  const updatedSummary = calculateWalletSummary(wallet);

  await CreditTransaction.create({
    userId,
    type: "credit",
    amount,
    reason,
    balanceAfter: updatedSummary.remainingCredits,
    metadata,
  });

  return {
    wallet,
    summary: updatedSummary,
  };
};

export const switchUserPlan = async ({
  userId,
  planKey,
  billingCycle = "monthly",
  paymentMethod,
  lastPaymentId = null,
}) => {
  const normalizedPlanKey = String(planKey || "").toLowerCase();
  const normalizedBillingCycle = String(billingCycle || "monthly").toLowerCase();

  if (!normalizedPlanKey) {
    const err = new Error("planKey is required");
    err.statusCode = 400;
    throw err;
  }

  if (!VALID_BILLING_CYCLES.includes(normalizedBillingCycle)) {
    const err = new Error("Invalid billing cycle");
    err.statusCode = 400;
    throw err;
  }

  const targetPlan = await Plan.findOne({ key: normalizedPlanKey, isActive: true });
  if (!targetPlan) {
    const err = new Error("Requested plan does not exist");
    err.statusCode = 404;
    throw err;
  }

  const { subscription, wallet } = await ensureUserBillingSetup(userId);

  const now = new Date();
  const nextPeriodEnd = addBillingPeriod(now, normalizedBillingCycle);

  subscription.planId = targetPlan._id;
  subscription.planKey = targetPlan.key;
  subscription.billingCycle = normalizedBillingCycle;
  subscription.status = "active";
  subscription.currentPeriodStart = now;
  subscription.currentPeriodEnd = nextPeriodEnd;
  subscription.cancelAtPeriodEnd = false;
  subscription.lastPaymentId = lastPaymentId;
  subscription.paymentMethod = paymentMethod || subscription.paymentMethod || {};

  await subscription.save();

  wallet.monthlyAllowance = targetPlan.monthlyCredits;
  wallet.usedCredits = 0;
  wallet.lastResetAt = now;
  wallet.nextResetAt = nextPeriodEnd;
  await wallet.save();

  const summary = calculateWalletSummary(wallet);

  await CreditTransaction.create({
    userId,
    type: "credit",
    amount: targetPlan.monthlyCredits,
    reason: `plan_switch_${targetPlan.key}`,
    balanceAfter: summary.remainingCredits,
    metadata: {
      planKey: targetPlan.key,
      billingCycle: normalizedBillingCycle,
      resetWindow: true,
    },
  });

  return {
    plan: targetPlan,
    subscription,
    wallet,
    summary,
  };
};

export const getBillingOverview = async (userId) => {
  const { subscription, wallet, plan } = await ensureUserBillingSetup(userId);
  const summary = calculateWalletSummary(wallet);

  return {
    currentPlan: {
      key: plan?.key,
      name: plan?.name,
      description: plan?.description,
      monthlyPrice: plan?.monthlyPrice,
      yearlyPrice: plan?.yearlyPrice,
      monthlyCredits: plan?.monthlyCredits,
      features: plan?.features || [],
    },
    subscription: {
      id: subscription._id,
      status: subscription.status,
      billingCycle: subscription.billingCycle,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      autoRenew: subscription.autoRenew,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      paymentMethod: subscription.paymentMethod,
    },
    summary,
    creditRules: FEATURE_MODULES,
  };
};

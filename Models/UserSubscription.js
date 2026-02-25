import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";

const paymentMethodSchema = new mongoose.Schema(
  {
    brand: { type: String, default: "" },
    last4: { type: String, default: "" },
    expMonth: { type: Number, min: 1, max: 12 },
    expYear: { type: Number, min: 2000 },
  },
  { _id: false },
);

const userSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    planKey: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "canceled", "past_due"],
      default: "active",
      index: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: paymentMethodSchema,
      default: () => ({}),
    },
    lastPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  },
  { timestamps: true },
);

const UserSubscription =
  DB1.models.UserSubscription ||
  DB1.model("UserSubscription", userSubscriptionSchema, "user_subscriptions");

export default UserSubscription;

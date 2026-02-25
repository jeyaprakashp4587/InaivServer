import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";

const creditTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit", "adjustment"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

const CreditTransaction =
  DB1.models.CreditTransaction ||
  DB1.model("CreditTransaction", creditTransactionSchema, "credit_transactions");

export default CreditTransaction;

import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";

const creditWalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    monthlyAllowance: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    bonusCredits: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    usedCredits: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lifetimeUsedCredits: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lastResetAt: {
      type: Date,
      required: true,
    },
    nextResetAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

creditWalletSchema.virtual("totalCredits").get(function totalCredits() {
  return (this.monthlyAllowance || 0) + (this.bonusCredits || 0);
});

const CreditWallet =
  DB1.models.CreditWallet || DB1.model("CreditWallet", creditWalletSchema, "credit_wallets");

export default CreditWallet;

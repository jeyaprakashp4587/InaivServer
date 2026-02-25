import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";

const planSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    monthlyPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    yearlyPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    monthlyCredits: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Plan = DB1.models.Plan || DB1.model("Plan", planSchema, "plans");

export default Plan;

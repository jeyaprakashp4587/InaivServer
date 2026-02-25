import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";

const saasAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productUrl: {
      type: String,
      required: true,
      trim: true,
    },
    productDescription: {
      type: String,
      default: "",
      trim: true,
    },
    selectedFeatureIds: {
      type: [Number],
      default: [],
    },
    selectedFeatures: {
      type: [String],
      default: [],
    },
    creditsCharged: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
      default: "success",
      index: true,
    },
    model: {
      type: String,
      default: "",
    },
    promptVersion: {
      type: String,
      default: "v1",
    },
    usage: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    errorMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const SaasAnalysis =
  DB1.models.SaasAnalysis || DB1.model("SaasAnalysis", saasAnalysisSchema, "saas_analyses");

export default SaasAnalysis;

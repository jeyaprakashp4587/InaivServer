import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";

const freelanceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  skills: [String],
  budget: Number,
  status: {
    type: String,
    enum: ["open", "in_progress", "completed", "cancelled"],
    default: "open",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default DB1.model("Freelance", freelanceSchema, "freelances");

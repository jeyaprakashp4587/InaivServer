import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  District: String,
  isStrictAllow: { type: Boolean, default: false },
  pendingJoinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isPrivate: { type: Boolean, default: false },
});

export default DB1.model("Group", groupSchema, "groups");

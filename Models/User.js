import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    uid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    provider: {
      type: String,
      default: "google",
    },
    companyName: {
      type: String,
      default: "",
      trim: true,
    },
    imgUrl: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "guest", "admin"],
      default: "user",
    },
    FCMtoken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const User = DB1.models.User || DB1.model("User", userSchema, "users");

export default User;

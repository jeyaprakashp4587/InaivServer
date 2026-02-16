import mongoose from "mongoose";
import DB1 from "../DB/DB1";

const notificationSchema = new mongoose.Schema({
  notificationUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notifications: [
    {
      notificationType: {
        type: String,
        enum: ["connections", "posts", "groupApprovals", "chats"],
      },
    },
  ],
});
export const Notifications = DB1.model(
  "Notification",
  notificationSchema,
  "notifications",
);

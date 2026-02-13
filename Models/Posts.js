import mongoose from "mongoose";

const postsSchema = new mongoose.Schema({
  title: String,
  content: String,
  likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  commentedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  collabedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
  imageUrl: String,
  date: { type: Date, default: Date.now },
});

export const Posts = mongoose.model("Posts", postsSchema, "posts");

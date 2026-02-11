import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";

const sellNoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  price: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default DB1.model("SellNote", sellNoteSchema, "sellnotes");

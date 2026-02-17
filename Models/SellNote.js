import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";

const sellNoteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  price: { type: String, default: "0" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  contactNumber: { type: String, default: "" },
  imgUrl: { type: String, default: "" },
});

export default DB1.model("SellNote", sellNoteSchema, "sellnotes");

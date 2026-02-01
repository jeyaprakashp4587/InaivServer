import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  FCMtoken: {
    type: String,
  },
  number: {
    type: String,
    required: true,
    unique: true,
  },
  college: {
    type: String,
    required: true,
  },
  imgUrl: {
    type: String,
  },
  groups: [
    {
      groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    },
  ],
  Connections: [
    {
      connectionId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
});

export default DB1.model("User", userSchema);

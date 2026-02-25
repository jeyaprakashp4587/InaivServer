import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const DbConfig = process.env.MONGO_URI;

if (!DbConfig) {
  throw new Error("MONGO_URI is not configured in backend/.env");
}

const DB1 = mongoose.createConnection(DbConfig, {
  autoIndex: true,
});

DB1.on("error", (err) => {
  console.error("DB1 connection error:", err?.message || err);
});

export default DB1;

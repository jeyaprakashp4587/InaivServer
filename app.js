import express from "express";
import authRoutes from "./Routes/authroutes.js";
import billingRoutes from "./Routes/billingRoutes.js";
import paymentRoutes from "./Routes/paymentRoutes.js";
import analysisRoutes from "./Routes/analysisRoutes.js";
import { verifyToken } from "./Middlewares/JWT.js";

import bodyParser from "body-parser";
import cors from "cors";
const app = express();

// middlewares
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// health check
app.get("/get", (req, res) => {
  console.log("server alive");
  res.send("Server is alive");
});

// routes
app.use("/auth", authRoutes);
app.use("/billing", verifyToken, billingRoutes);
app.use("/payments", verifyToken, paymentRoutes);
app.use("/analysis", verifyToken, analysisRoutes);

export default app;

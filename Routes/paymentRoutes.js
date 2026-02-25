import express from "express";
import {
  confirmPayment,
  createPaymentIntent,
  listPayments,
} from "../Controllers/paymentController.js";

const router = express.Router();

router.post("/intents", createPaymentIntent);
router.post("/confirm", confirmPayment);
router.get("/history", listPayments);

export default router;

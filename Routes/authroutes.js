import express from "express";
const router = express.Router();
import {
  getUser,
  login,
  refresh,
  registerUser,
} from "../Controllers/authController.js";
import { verifyToken } from "../Middlewares/JWT.js";
import { verifyFirebaseToken } from "../Middlewares/verifyGoogleAuth.js";

router.post("/register", verifyFirebaseToken, registerUser);
router.post("/login", verifyFirebaseToken, login);
router.post("/refresh", refresh);
router.get("/getUser/:userId", verifyToken, getUser);

export default router;

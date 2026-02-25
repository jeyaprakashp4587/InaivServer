import express from "express";
const router = express.Router();
import {
  getMe,
  getUser,
  guestLogin,
  login,
  refresh,
  registerUser,
} from "../Controllers/authController.js";
import { verifyToken } from "../Middlewares/JWT.js";
import { verifyFirebaseToken } from "../Middlewares/verifyGoogleAuth.js";

router.post("/register", verifyFirebaseToken, registerUser);
router.post("/login", verifyFirebaseToken, login);
router.post("/refresh", refresh);
router.get("/me", verifyToken, getMe);
router.get("/getUser/:userId", verifyToken, getUser);
router.post("/guestLogin", guestLogin);

export default router;

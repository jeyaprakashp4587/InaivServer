import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../Models/User.js";
import { createAccessToken, createRefreshToken } from "../Middlewares/JWT.js";
import { ensureUserBillingSetup, getBillingOverview } from "../Services/billingService.js";

dotenv.config();

const REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER || "rf-backend";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "rf-frontend";

const buildAuthPayload = async (userId) => {
  const accessToken = await createAccessToken(userId);
  const refreshToken = await createRefreshToken(userId);
  return { accessToken, refreshToken };
};

const safeBillingBootstrap = async (userId, stageLabel) => {
  try {
    await ensureUserBillingSetup(userId);
  } catch (billingErr) {
    console.warn(`Billing bootstrap failed during ${stageLabel}:`, billingErr.message);
  }
};

export const registerUser = async (req, res) => {
  try {
    const { uid, imgUrl, email, name: firebaseName } = req.user || {};
    const { name, companyName = "" } = req.body || {};

    if (!uid || !email) {
      return res.status(401).json({ error: "Invalid Firebase auth payload" });
    }

    const normalizedName = String(name || firebaseName || "").trim();

    if (!normalizedName) {
      return res.status(400).json({ error: "name is required" });
    }

    const existingUser = await User.findOne({ uid }).lean();
    if (existingUser) {
      return res.status(409).json({
        error: "User already exists. Please login.",
        code: "USER_ALREADY_EXISTS",
      });
    }

    const newUser = await User.create({
      uid,
      email,
      name: normalizedName,
      companyName: String(companyName || "").trim(),
      imgUrl: imgUrl || "",
      role: "user",
      provider: "google",
    });

    await safeBillingBootstrap(newUser._id, "register");

    const tokens = await buildAuthPayload(newUser._id);
    const overview = await getBillingOverview(newUser._id);

    return res.status(201).json({
      message: "Register successful",
      userId: newUser._id,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        companyName: newUser.companyName,
        imgUrl: newUser.imgUrl,
        role: newUser.role,
      },
      billing: overview,
      tokens,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req, res) => {
  const { uid } = req.user || {};

  try {
    if (!uid) {
      return res.status(401).json({ error: "Invalid Firebase auth payload" });
    }

    const userData = await User.findOne({ uid });

    if (!userData) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
        needsSignup: true,
      });
    }

    await safeBillingBootstrap(userData._id, "login");

    const tokens = await buildAuthPayload(userData._id);
    const overview = await getBillingOverview(userData._id);

    return res.status(200).json({
      message: "Login successful",
      userId: userData._id,
      user: {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        companyName: userData.companyName,
        imgUrl: userData.imgUrl,
        role: userData.role,
      },
      billing: overview,
      tokens,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    if (!refreshToken) {
      return res.status(401).json({ msg: "No token provided" });
    }

    if (!REFRESH_SECRET) {
      return res.status(500).json({ error: "Refresh token secret is not configured" });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (decoded?.tokenType !== "refresh" || !decoded?.sub) {
      return res.status(403).json({ msg: "Invalid refresh token type" });
    }

    const newAccessToken = await createAccessToken(decoded.sub);

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(403).json({ msg: "Invalid or expired refresh token" });
    }

    console.error("Refresh token error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getUser = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const isOwner = String(req.userId) === String(userId);
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const userData = await User.findById(userId).select(
      "_id name email companyName imgUrl role uid",
    );

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    await safeBillingBootstrap(userData._id, "getUser");
    const overview = await getBillingOverview(userData._id);

    return res.status(200).json({ user: userData, billing: overview });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const userData = await User.findById(req.userId).select(
      "_id name email companyName imgUrl role uid",
    );

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    await safeBillingBootstrap(userData._id, "getMe");
    const overview = await getBillingOverview(userData._id);

    return res.status(200).json({ user: userData, billing: overview });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const guestLogin = async (_req, res) => {
  try {
    const guestUser = await User.create({
      name: "Guest user",
      email: `guest_${Date.now()}@guest.local`,
      companyName: "Guest Company",
      imgUrl: "https://i.ibb.co/4RJhQBn/boy1.jpg",
      role: "guest",
      uid: `guest_${Date.now()}`,
      provider: "guest",
    });

    await safeBillingBootstrap(guestUser._id, "guestLogin");

    const tokens = await buildAuthPayload(guestUser._id);
    const overview = await getBillingOverview(guestUser._id);

    return res.status(200).json({
      message: "Guest login successful",
      userId: guestUser._id,
      user: {
        _id: guestUser._id,
        name: guestUser.name,
        email: guestUser.email,
        companyName: guestUser.companyName,
        imgUrl: guestUser.imgUrl,
        role: guestUser.role,
      },
      billing: overview,
      tokens,
    });
  } catch (error) {
    console.error("Guest login error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

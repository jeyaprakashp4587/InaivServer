import jwt from "jsonwebtoken";
import dotEnv from "dotenv";
import User from "../Models/User.js";
dotEnv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "1h";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const JWT_ISSUER = process.env.JWT_ISSUER || "rf-backend";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "rf-frontend";

const assertJwtSecret = (name, value) => {
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
};

const signOptions = (expiresIn) => ({
  expiresIn,
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
});

const verifyOptions = () => ({
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
});

export const createAccessToken = async (id) => {
  assertJwtSecret("JWT_ACCESS_TOKEN_SECRET", ACCESS_SECRET);
  const accesstoken = jwt.sign(
    { sub: String(id), tokenType: "access" },
    ACCESS_SECRET,
    signOptions(ACCESS_EXPIRES_IN),
  );
  return accesstoken;
};

export const createRefreshToken = async (id) => {
  assertJwtSecret("JWT_REFRESH_TOKEN_SECRET", REFRESH_SECRET);
  const refreshToken = jwt.sign(
    { sub: String(id), tokenType: "refresh" },
    REFRESH_SECRET,
    signOptions(REFRESH_EXPIRES_IN),
  );
  return refreshToken;
};

export const verifyToken = async (req, res, next) => {
  if (!ACCESS_SECRET) {
    return res.status(500).json({ msg: "JWT_ACCESS_TOKEN_SECRET is not configured" });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Missing bearer token" });
  }

  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({ msg: "Missing bearer token" });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET, verifyOptions());

    if (decoded?.tokenType !== "access" || !decoded?.sub) {
      return res.status(403).json({ msg: "Invalid token type" });
    }

    const user = await User.findById(decoded.sub).select(
      "name email companyName role _id imgUrl",
    );

    if (!user) return res.status(404).json({ msg: "User not found" });
    req.userId = String(user._id);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
};

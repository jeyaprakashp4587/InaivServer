import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import { createAccessToken, createRefreshToken } from "../Middlewares/JWT.js";
import DB1 from "../DB/DB1.js";

export const registerUser = async (req, res) => {
  try {
    const { uid, imgUrl } = req.user;
    const { name, collegeName, department, year } = req.body;
    const newUser = await User.create({
      uid,
      name,
      college: {
        collegeName: collegeName,
        department: department,
        year: year,
      },
      imgUrl: imgUrl,
    });
    const accessToken = await createAccessToken(newUser._id);
    const refreshToken = await createRefreshToken(newUser._id);
    res.status(201).json({
      message: "Register succesfully",
      userId: newUser._id,
      tokens: { accessToken, refreshToken },
    });
    console.log("register sucesfull");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
// login
export const login = async (req, res) => {
  const { uid } = req.user;
  console.log(uid);

  try {
    const userData = await User.findOne({ uid: uid });

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    const accessToken = await createAccessToken(userData._id);
    const refreshToken = await createRefreshToken(userData._id);
    console.log(userData);

    res.status(200).json({
      message: "login successful",
      userId: userData._id,
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// refresh token
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ msg: "No token provided" });

    // Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
    );

    // Create a new access token (await the async function)
    const newAccessToken = await createAccessToken(decoded.userId);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(403).json({ msg: "Invalid or expired refresh token" });
    }
    console.error("Refresh token error:", err);
    res.status(500).json({ error: err.message });
  }
};

// get User
export const getUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const userData = await User.findById(userId).select(
      "imgUrl name college _id",
    );
    if (userData) {
      const accessToken = await createAccessToken(userData._id);
      const refreshToken = await createRefreshToken(userData._id);
      res
        .status(200)
        .json({ user: userData, tokens: { accessToken, refreshToken } });
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

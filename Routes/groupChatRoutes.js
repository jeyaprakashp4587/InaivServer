import express from "express";
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from "../Controllers/groupChatController.js";
import { verifyToken } from "../Middlewares/JWT.js";

const router = express.Router();

router.get("/", verifyToken, getAll);
export default router;

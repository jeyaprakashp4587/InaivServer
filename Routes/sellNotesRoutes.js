import express from "express";
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from "../Controllers/sellNotesController.js";
import { verifyToken } from "../Middlewares/JWT.js";

const router = express.Router();

router.get("/", verifyToken, getAll);
router.get("/:id", verifyToken, getById);
router.post("/", verifyToken, create);
router.put("/:id", verifyToken, update);
router.delete("/:id", verifyToken, remove);

export default router;

import express from "express";
import {
  getAll,
  getById,
  create,
  update,
  remove,
  getSuggestionsGroups,
} from "../Controllers/groupsController.js";
import { verifyToken } from "../Middlewares/JWT.js";

const router = express.Router();

router.get("/getAllGroups", verifyToken, getAll);
router.get("/getParticularGroup/:id", verifyToken, getById);
router.post("/createGroup", verifyToken, create);
router.put("/updateGroup:id", verifyToken, update);
router.delete("/deleteGroup/:id", verifyToken, remove);
router.get("/getSuggestionGroups", verifyToken, getSuggestionsGroups);

export default router;

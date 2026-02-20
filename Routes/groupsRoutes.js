import express from "express";
import {
  getAll,
  getById,
  create,
  update,
  remove,
  getSuggestionsGroups,
} from "../Controllers/groupsController.js";
// import { } from "../Middlewares/JWT.js";

const router = express.Router();

router.get("/getAllGroups", getAll);
router.get("/getParticularGroup/:id", getById);
router.post("/createGroup", create);
router.put("/updateGroup:id", update);
router.delete("/deleteGroup/:id", remove);
router.get("/getSuggestionGroups", getSuggestionsGroups);

export default router;

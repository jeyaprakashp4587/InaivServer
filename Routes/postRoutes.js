import express from "express";
import {
  createPost,
  deletePostById,
  getPostById,
  updatePostById,
} from "../Controllers/postController";

const router = express.Router();

router.post("/create", createPost);
router.get("/getPost/:postId", getPostById);
router.put("/updatePost/:postId", updatePostById);
router.delete("/deletePost/:postId", deletePostById);

export default router;

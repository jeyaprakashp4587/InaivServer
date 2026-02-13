import { Posts } from "../Models/Posts";

export const createPost = async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    const newPost = new Posts({ title, content, imageUrl });
    await newPost.save();
    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
  }
};

export const getAllGroupPosts = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const posts = await Posts.aggregate([
      {
        $match: { collabedGroup: groupId },
      },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
    ]);
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving posts", error: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving post", error: error.message });
  }
};

export const updatePostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, imageUrl } = req.body;
    const updatedPost = await Posts.findByIdAndUpdate(
      postId,
      { title, content, imageUrl },
      { new: true },
    );
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res
      .status(200)
      .json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating post", error: error.message });
  }
};

export const deletePostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const deletedPost = await Posts.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
};

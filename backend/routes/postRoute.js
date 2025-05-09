import express from "express";
import { createPost, deletePost, fetchTwitterPosts, getPostById, getPostsByHashtag, getPostsByUser, initiateTwitterPost, twitterPostCallback, updatePost } from "../controllers/postController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/posts - Create a new post
router.post("/", authMiddleware, createPost);

// GET /api/posts/user/:userId - Get posts by userId
router.get("/user/:userId", getPostsByUser);

// GET /api/posts/twitter - Fetch Twitter posts dynamically
router.get("/twitter", fetchTwitterPosts);

// GET /api/posts/initiate-twitter-post - Initiate Twitter OAuth for post fetching
router.get("/initiate-twitter-post", authMiddleware, initiateTwitterPost);

// GET /api/posts/twitter-post-callback - Handle Twitter post fetch callback
router.get("/twitter-post-callback", twitterPostCallback);

// GET /api/posts/:platform/:postId - Get post by platform and postId
router.get("/:platform/:postId", getPostById);

// PUT /api/posts - Update a post
router.put("/", authMiddleware, updatePost);

// DELETE /api/posts/:platform/:postId - Delete a post
router.delete("/:platform/:postId", authMiddleware, deletePost);

// GET /api/posts/hashtag/:hashtag - Get posts by hashtag
router.get("/hashtag/:hashtag", getPostsByHashtag);

export default router;
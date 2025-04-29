// Import required modules
import express from "express";
import { createPost, deletePost, getPostById, getPostsByHashtag, getPostsByUser, updatePost } from "../controllers/postController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";


// Create an Express router
const router = express.Router();

//Post/api/posts - Create a new post
//http://localhost:5000/api/posts/
/*{
    "platform": "platform_name",
    "postId": "post_id",
    "userId": "user_id",
    "content": "post_content",
    "postedAt": "post_date",
    "likes": "post_likes",
    "comments": "post_comments",
    "shares": "post_shares",
    "hashtags": "post_hashtags",
    "sentiment": "post_sentiment"
} */
router.post("/", authMiddleware, createPost);

// GET /api/posts/user/:userId - Get posts by userId
// http://localhost:5000/api/posts/user/<user_id>
router.get("/user/:userId", getPostsByUser);

// GET /api/posts/:platform/:postId - Get post by platform and postId
// http://localhost:5000/api/posts/<platform>/<post_id>
router.get("/:platform/:postId", getPostById);

// PUT /api/posts - Update a post
// http://localhost:5000/api/posts/
router.put("/", authMiddleware, updatePost);

// DELETE /api/posts/:platform/:postId - Delete a post
// http://localhost:5000/api/posts/<platform>/<post_id>
router.delete("/:platform/:postId", authMiddleware, deletePost);


// GET /api/posts/hashtag/:hashtag - Get posts by hashtag
// http://localhost:5000/api/posts/hashtag/<hashtag>
router.get("/hashtag/:hashtag", getPostsByHashtag);


export default router;

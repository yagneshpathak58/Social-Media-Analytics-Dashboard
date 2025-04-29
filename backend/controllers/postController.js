//import Post model and User model
import Post from "../models/postModel.js";
import User from "../models/userModel.js";

// Controller: Create a new post
export const createPost = async (req, res) => {
    try {
      // Extract post data from request body
      const { platform, postId, userId, content, postedAt, likes, comments, shares, hashtags, sentiment } = req.body;
  
      // Validate required fields
      if (!platform || !postId || !userId || !content || !postedAt) {
        return res.status(400).json({ message: "Platform, postId, userId, content, and postedAt are required" });
      }
  
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Prepare post data
      const postData = {
        platform,
        postId,
        userId,
        content,
        postedAt: new Date(postedAt),
        likes: likes || 0,
        comments: comments || 0,
        shares: shares || 0,
        hashtags: hashtags || [],
        sentiment,
      };
  
      // Create the post using the Post model
      const post = await Post.createPost(postData);
  
      // Return the created post
      res.status(201).json(post);
    } catch (error) {
      // Handle errors (e.g., duplicate postId, validation errors)
      res.status(500).json({ message: `Error creating post: ${error.message}` });
    }
  };

  // Controller: Get posts by userId
export const getPostsByUser = async (req, res) => {
    try {
      // Extract userId from request parameters
      const { userId } = req.params;
  
      // Find posts by userId
      const posts = await Post.findByUserId(userId);
      if (!posts.length) {
        return res.status(404).json({ message: "No posts found for this user" });
      }
  
      // Return the posts
      res.json(posts);
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: `Error fetching posts: ${error.message}` });
    }
  };

  // Controller: Get post by platform and postId
export const getPostById = async (req, res) => {
    try {
      // Extract platform and postId from request parameters
      const { platform, postId } = req.params;
  
      // Find the post
      const post = await Post.findByPlatformAndPostId(platform, postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      // Return the post
      res.json(post);
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: `Error fetching post: ${error.message}` });
    }
  };

  // Controller: Update a post
export const updatePost = async (req, res) => {
    try {
      // Extract platform, postId, and update data from request body
      const { platform, postId, content, likes, comments, shares, hashtags, sentiment } = req.body;
  
      // Prepare update data
      const updateData = {};
      if (content) updateData.content = content;
      if (likes !== undefined) updateData.likes = likes;
      if (comments !== undefined) updateData.comments = comments;
      if (shares !== undefined) updateData.shares = shares;
      if (hashtags) updateData.hashtags = hashtags;
      if (sentiment) updateData.sentiment = sentiment;
  
      // Update the post
      const updatedPost = await Post.updatePost(postId, platform, updateData);
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      // Return the updated post
      res.json(updatedPost);
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: `Error updating post: ${error.message}` });
    }
  };

  // Controller: Delete a post
export const deletePost = async (req, res) => {
    try {
      // Extract platform and postId from request parameters
      const { platform, postId } = req.params;
  
      // Delete the post
      const deletedPost = await Post.deletePost(postId, platform);
      if (!deletedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      // Return success message
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: `Error deleting post: ${error.message}` });
    }
  };
  

  // Controller: Get posts by hashtag
export const getPostsByHashtag = async (req, res) => {
    try {
      // Extract hashtag from request parameters
      const { hashtag } = req.params;
  
      // Find posts by hashtag
      const posts = await Post.findByHashtag(hashtag);
      if (!posts.length) {
        return res.status(404).json({ message: "No posts found with this hashtag" });
      }
  
      // Return the posts
      res.json(posts);
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: `Error fetching posts: ${error.message}` });
    }
  };
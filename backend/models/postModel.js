// Import mongoose to define the schema and interact with MongoDB
import mongoose from "mongoose";

// Define the post schema using mongoose.Schema
const postSchema = new mongoose.Schema({
  // Platform field: required, specifies the social media platform
  platform: {
    type: String,
    required: [true, "Platform is required"], // Error message if missing
    enum: ["Twitter", "Instagram", "Facebook"], // Restrict to specific platforms
    trim: true, // Remove whitespace
  },
  // PostId field: required, unique identifier from the social media platform
  postId: {
    type: String,
    required: [true, "Post ID is required"],
    trim: true, // Remove whitespace
  },
  // UserId field: references the User model, required
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links to the User collection
    required: [true, "User ID is required"],
  },
  // Content field: required, the text content of the post
  content: {
    type: String,
    required: [true, "Content is required"],
    trim: true, // Remove whitespace
  },
  // PostedAt field: required, timestamp of when the post was made
  postedAt: {
    type: Date,
    required: [true, "Posted date is required"],
  },
  // Likes field: number of likes, defaults to 0
  likes: {
    type: Number,
    default: 0,
    min: [0, "Likes cannot be negative"], // Ensure non-negative
  },
  // Comments field: number of comments, defaults to 0
  comments: {
    type: Number,
    default: 0,
    min: [0, "Comments cannot be negative"],
  },
  // Shares field: number of shares/retweets, defaults to 0
  shares: {
    type: Number,
    default: 0,
    min: [0, "Shares cannot be negative"],
  },
  // Hashtags field: array of hashtags, optional
  hashtags: [
    {
      type: String,
      trim: true, // Remove whitespace from each hashtag
    },
  ],
  // Sentiment field: sentiment analysis result, optional
  sentiment: {
    type: String,
    enum: ["positive", "negative", "neutral"], // Restrict to valid values
  },
});

// Ensure unique postId per platform to prevent duplicates
postSchema.index(
    { platform: 1, postId: 1 },
    { unique: true } // Unique constraint on platform + postId
  );
  
  // Index on userId and postedAt for efficient querying
  postSchema.index({ userId: 1, postedAt: -1 }); // Sort by postedAt descending
  
  // Static method: Create a new post
  postSchema.statics.createPost = async function (postData) {
    // Create a new post document with the provided data
    const post = new this(postData);
    // Save the post to the database and return the result
    return await post.save();
  };
  
  // Static method: Find a post by platform and postId
  postSchema.statics.findByPlatformAndPostId = async function (platform, postId) {
    // Find one post document matching the platform and postId
    return await this.findOne({ platform, postId });
  };
  
  // Static method: Find posts by userId
  postSchema.statics.findByUserId = async function (userId) {
    // Find all posts for a given userId, sorted by postedAt descending
    return await this.find({ userId }).sort({ postedAt: -1 });
  };
  
  // Static method: Find posts by platform
  postSchema.statics.findByPlatform = async function (platform) {
    // Find all posts for a given platform, sorted by postedAt descending
    return await this.find({ platform }).sort({ postedAt: -1 });
  };
  
  // Static method: Find posts by hashtag
  postSchema.statics.findByHashtag = async function (hashtag) {
    // Find all posts containing the specified hashtag, case-insensitive
    return await this.find({ hashtags: new RegExp(hashtag, "i") }).sort({
      postedAt: -1,
    });
  };
  
  // Static method: Update a post
  postSchema.statics.updatePost = async function (postId, platform, updateData) {
    // Find and update the post by platform and postId, return the updated document
    return await this.findOneAndUpdate(
      { postId, platform }, // Match criteria
      { $set: updateData }, // Update specified fields
      { new: true, runValidators: true } // Return updated document, validate changes
    );
  };
  
  // Static method: Delete a post
  postSchema.statics.deletePost = async function (postId, platform) {
    // Find and delete the post by platform and postId
    return await this.findOneAndDelete({ postId, platform });
  };
  
  // Static method: Get all posts
  postSchema.statics.getAllPosts = async function () {
    // Find all posts, sorted by postedAt descending
    return await this.find().sort({ postedAt: -1 });
  };
  
  // Instance method: Increment likes
  postSchema.methods.incrementLikes = async function () {
    // Increment the likes field by 1
    this.likes += 1;
    // Save the updated document
    return await this.save();
  };
  
  // Instance method: Update sentiment
  postSchema.methods.updateSentiment = async function (sentiment) {
    // Update the sentiment field
    this.sentiment = sentiment;
    // Save the updated document
    return await this.save();
  };
  
  // Create the Post model from the schema
const Post = mongoose.model("Post", postSchema, "posts_collection");

// Export the Post model for use in other parts of the application
export default Post;
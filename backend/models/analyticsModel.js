// Import mongoose to define the schema and interact with MongoDB
import mongoose from "mongoose";

// Define the analytics schema using mongoose.Schema
const analyticsSchema = new mongoose.Schema({
  // UserId field: references the User model, required
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links to the User collection
    required: [true, "User ID is required"],
  },
  // Platform field: required, specifies the social media platform
  platform: {
    type: String,
    required: [true, "Platform is required"],
    enum: ["Twitter", "Instagram", "Facebook"], // Restrict to specific platforms
    trim: true, // Remove whitespace
  },
  // PostId field: references the Post model, optional (for post-specific analytics)
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post", // Links to the Post collection
  },
  // EngagementRate field: calculated engagement rate (e.g., 0.05 for 5%)
  engagementRate: {
    type: Number,
    min: [0, "Engagement rate cannot be negative"],
  },
  // Reach field: number of unique viewers, optional
  reach: {
    type: Number,
    min: [0, "Reach cannot be negative"],
  },
  // Impressions field: total views, optional
  impressions: {
    type: Number,
    min: [0, "Impressions cannot be negative"],
  },
  // Trend field: trend analysis result, optional
  trend: {
    type: String,
    enum: ["increasing", "stable", "decreasing"], // Restrict to valid values
  },
  // AnalyzedAt field: timestamp of when the analysis was performed
  analyzedAt: {
    type: Date,
    default: Date.now, // Set to current timestamp
  },
});

// Index on userId and analyzedAt for efficient querying
analyticsSchema.index({ userId: 1, analyzedAt: -1 }); // Sort by analyzedAt descending
// Index on postId for post-specific analytics
analyticsSchema.index({ postId: 1 });

// Static method: Create a new analytics record
analyticsSchema.statics.createAnalytics = async function (analyticsData) {
    // Create a new analytics document with the provided data
    const analytics = new this(analyticsData);
    // Save the analytics to the database and return the result
    return await analytics.save();
  };

  // Static method: Find analytics by userId
analyticsSchema.statics.findByUserId = async function (userId) {
    // Find all analytics records for a given userId, sorted by analyzedAt descending
    return await this.find({ userId }).sort({ analyzedAt: -1 });
  };

  // Static method: Find analytics by postId
analyticsSchema.statics.findByPostId = async function (postId) {
    // Find all analytics records for a given postId, sorted by analyzedAt descending
    return await this.find({ postId }).sort({ analyzedAt: -1 });
  };

  // Static method: Find analytics by platform
analyticsSchema.statics.findByPlatform = async function (platform) {
    // Find all analytics records for a given platform, sorted by analyzedAt descending
    return await this.find({ platform }).sort({ analyzedAt: -1 });
  };

  // Static method: Update an analytics record
analyticsSchema.statics.updateAnalytics = async function (analyticsId, updateData) {
    // Find and update the analytics record by ID, return the updated document
    return await this.findByIdAndUpdate(
      analyticsId,
      { $set: updateData }, // Update specified fields
      { new: true, runValidators: true } // Return updated document, validate changes
    );
  };

  // Static method: Update an analytics record
analyticsSchema.statics.updateAnalytics = async function (analyticsId, updateData) {
    // Find and update the analytics record by ID, return the updated document
    return await this.findByIdAndUpdate(
      analyticsId,
      { $set: updateData }, // Update specified fields
      { new: true, runValidators: true } // Return updated document, validate changes
    );
  };

  // Static method: Delete an analytics record
analyticsSchema.statics.deleteAnalytics = async function (analyticsId) {
    // Find and delete the analytics record by ID
    return await this.findByIdAndDelete(analyticsId);
  };

  // Static method: Get all analytics records
analyticsSchema.statics.getAllAnalytics = async function () {
    // Find all analytics records, sorted by analyzedAt descending
    return await this.find().sort({ analyzedAt: -1 });
  };

  // Instance method: Update engagement rate
analyticsSchema.methods.updateEngagementRate = async function (engagementRate) {
    // Update the engagementRate field
    this.engagementRate = engagementRate;
    // Save the updated document
    return await this.save();
  };

  // Create the Analytics model from the schema
const Analytics = mongoose.model("Analytics", analyticsSchema, "analytics_collection");

// Export the Analytics model for use in other parts of the application
export default Analytics;
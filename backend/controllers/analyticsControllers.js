// Import required modules

import Analytics from "../models/analyticsModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";


// Controller: Create a new analytics record
export const createAnalytics = async (req, res) => {
    try {
      // Extract analytics data from request body
      const { userId, platform, postId, engagementRate, reach, impressions, trend } = req.body;
  
      // Validate required fields
      if (!userId || !platform) {
        return res.status(400).json({ message: "User ID and platform are required" });
      }
  
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Verify post exists if postId is provided
      if (postId) {
        const post = await Post.findById(postId);
        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }
      }
  
      // Prepare analytics data
      const analyticsData = {
        userId,
        platform,
        postId,
        engagementRate,
        reach,
        impressions,
        trend,
        analyzedAt: new Date(),
      };
  
      // Create the analytics record
      const analytics = await Analytics.createAnalytics(analyticsData);
  
      // Return the created analytics record
      res.status(201).json(analytics);
    } catch (error) {
      // Handle errors (e.g., validation errors)
      res.status(500).json({ message: `Error creating analytics: ${error.message}` });
    }
  };

  // Controller: Get analytics by userId
export const getAnalyticsByUser = async (req, res) => {
    try {
      // Extract userId from request parameters
      const { userId } = req.params;
  
      // Find analytics by userId
      const analytics = await Analytics.findByUserId(userId);
      if (!analytics.length) {
        return res.status(404).json({ message: "No analytics found for this user" });
      }
  
      // Return the analytics records
      res.json(analytics);
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: `Error fetching analytics: ${error.message}` });
    }
  };

  // Controller: Get analytics by postId
export const getAnalyticsByPost = async (req, res) => {
    try {
      // Extract postId from request parameters
      const { postId } = req.params;
  
      // Find analytics by postId
      const analytics = await Analytics.findByPostId(postId);
      if (!analytics.length) {
        return res.status(404).json({ message: "No analytics found for this post" });
      }
  
      // Return the analytics records
      res.json(analytics);
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: `Error fetching analytics: ${error.message}` });
    }
  };

  // Controller: Update an analytics record
export const updateAnalytics = async (req, res) => {
    try {
      // Extract analyticsId and update data from request body
      const { analyticsId, engagementRate, reach, impressions, trend } = req.body;
  
      // Validate required fields
      if (!analyticsId) {
        return res.status(400).json({ message: "Analytics ID is required" });
      }
  
      // Prepare update data
      const updateData = {};
      if (engagementRate !== undefined) updateData.engagementRate = engagementRate;
      if (reach !== undefined) updateData.reach = reach;
      if (impressions !== undefined) updateData.impressions = impressions;
      if (trend) updateData.trend = trend;
  
      // Update the analytics record
      const updatedAnalytics = await Analytics.updateAnalytics(analyticsId, updateData);
      if (!updatedAnalytics) {
        return res.status(404).json({ message: "Analytics record not found" });
      }
  
      // Return the updated analytics record
      res.json(updatedAnalytics);
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: `Error updating analytics: ${error.message}` });
    }
  };

  // Controller: Delete an analytics record
export const deleteAnalytics = async (req, res) => {
    try {
      // Extract analyticsId from request parameters
      const { analyticsId } = req.params;
  
      // Delete the analytics record
      const deletedAnalytics = await Analytics.deleteAnalytics(analyticsId);
      if (!deletedAnalytics) {
        return res.status(404).json({ message: "Analytics record not found" });
      }
  
      // Return success message
      res.json({ message: "Analytics record deleted successfully" });
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: `Error deleting analytics: ${error.message}` });
    }
  };
// Import required modules
import express from "express";
import { createAnalytics, deleteAnalytics, getAnalyticsByPost, getAnalyticsByUser, updateAnalytics } from "../controllers/analyticsControllers.js";


// Create an Express router
const router = express.Router();

// POST /api/analytics - Create a new analytics record
// http://localhost:5000/api/analytics/
/*{
    "userId": "user_id",
    "platform": "platform_name",
    "postId": "post_id",
    "engagementRate": "post_engagement_rate",
    "reach": "post_reach",
    "impressions": "post_impressions",
    "trend": "post_trend"
} */
router.post("/", createAnalytics);

// GET /api/analytics/user/:userId - Get analytics by userId
// http://localhost:5000/api/analytics/user/<user_id>
router.get("/user/:userId", getAnalyticsByUser);

// GET /api/analytics/post/:postId - Get analytics by postId
// http://localhost:5000/api/analytics/post/<post_id>
router.get("/post/:postId", getAnalyticsByPost);

// PUT /api/analytics - Update an analytics record
// http://localhost:5000/api/analytics/
/*{
    "userId": "user_id",
    "platform": "platform_name",
    "postId": "post_id",
    "engagementRate": "post_engagement_rate",
    "reach": "post_reach",
    "impressions": "post_impressions",
    "trend": "post_trend"
} */
router.put("/", updateAnalytics);

// DELETE /api/analytics/:analyticsId - Delete an analytics record
// http://localhost:5000/api/analytics/<analytics_id>
router.delete("/:analyticsId", deleteAnalytics);

export default router;
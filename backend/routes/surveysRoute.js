// Import required modules
import express from "express";
import { createSurvey, deleteSurvey, getAllSurveys, getSurveysByUser } from "../controllers/surveyControllers.js";


// Create an Express router
const router = express.Router();

// POST /api/surveys - Create a new survey
// http://localhost:5000/api/surveys/
/*{
    "userId": "user_id",
    "platform": "platform_name",
    "postId": "post_id",
    "engagementRate": "post_engagement_rate",
    "reach": "post_reach",
    "impressions": "post_impressions",
    "trend": "post_trend"
} */
router.post("/", createSurvey);

// GET /api/surveys/user/:userId - Get surveys by userId
// http://localhost:5000/api/surveys/user/<user_id>
router.get("/user/:userId", getSurveysByUser);

// GET /api/surveys - Get all surveys
// http://localhost:5000/api/surveys/
router.get("/", getAllSurveys);

// DELETE /api/surveys/:surveyId - Delete a survey
// http://localhost:5000/api/surveys/<survey_id>
router.delete("/:surveyId", deleteSurvey);

export default router;
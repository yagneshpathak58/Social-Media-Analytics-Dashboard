// // Import required modules
// import express from "express";
// import { createSurvey, deleteSurvey, getAllSurveys, getSurveysByUser } from "../controllers/surveyControllers.js";


// // Create an Express router
// const router = express.Router();

// // POST /api/surveys - Create a new survey
// // http://localhost:5000/api/surveys/
// /*{
//     "userId": "user_id",
//     "platform": "platform_name",
//     "postId": "post_id",
//     "engagementRate": "post_engagement_rate",
//     "reach": "post_reach",
//     "impressions": "post_impressions",
//     "trend": "post_trend"
// } */
// router.post("/", createSurvey);

// // GET /api/surveys/user/:userId - Get surveys by userId
// // http://localhost:5000/api/surveys/user/<user_id>
// router.get("/user/:userId", getSurveysByUser);

// // GET /api/surveys - Get all surveys
// // http://localhost:5000/api/surveys/
// router.get("/", getAllSurveys);

// // DELETE /api/surveys/:surveyId - Delete a survey
// // http://localhost:5000/api/surveys/<survey_id>
// router.delete("/:surveyId", deleteSurvey);

// export default router;



import express from "express";
// import { createSurvey, deleteSurvey, getAllSurveys, getSurveysByUser } from "../controllers/surveyController.js";
// import{}
import Survey from "../models/surveyModel.js";
import { createSurvey, deleteSurvey, getAllSurveys, getSurveysByUser } from "../controllers/surveyControllers.js";

// Create an Express router
const router = express.Router();

// POST /api/surveys - Create a new survey
router.post("/", createSurvey);

// GET /api/surveys/user/:userId - Get surveys by userId
router.get("/user/:userId", getSurveysByUser);

// GET /api/surveys/post/:postId - Get surveys by postId
router.get("/post/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const surveys = await Survey.findByPostId(postId);
    if (!surveys.length) {
      return res.status(404).json({ message: "No surveys found for this post" });
    }
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: `Error fetching surveys: ${error.message}` });
  }
});

// GET /api/surveys - Get all surveys
router.get("/", getAllSurveys);

// DELETE /api/surveys/:surveyId - Delete a survey
router.delete("/:surveyId", deleteSurvey);

export default router;
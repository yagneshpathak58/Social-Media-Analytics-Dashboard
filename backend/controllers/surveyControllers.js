import Survey from "../models/surveyModel.js";
import User from "../models/userModel.js";


// Controller: Create a new survey
export const createSurvey = async (req, res) => {
    try {
      // Extract survey data from request body
      const { userId, questions } = req.body;
  
      // Validate required fields
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: "Questions array is required and must not be empty" });
      }
  
      // Verify user exists if userId is provided
      if (userId) {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
      }
  
      // Validate questions array
      for (const q of questions) {
        if (!q.question || !q.response) {
          return res.status(400).json({ message: "Each question must have a question and response" });
        }
      }
  
      // Prepare survey data
      const surveyData = {
        userId,
        questions,
        submittedAt: new Date(),
      };
  
      // Create the survey
      const survey = await Survey.createSurvey(surveyData);
  
      // Return the created survey
      res.status(201).json(survey);
    } catch (error) {
      // Handle errors (e.g., validation errors)
      res.status(500).json({ message: `Error creating survey: ${error.message}` });
    }
  };

  // Controller: Get surveys by userId
export const getSurveysByUser = async (req, res) => {
    try {
      // Extract userId from request parameters
      const { userId } = req.params;
  
      // Find surveys by userId
      const surveys = await Survey.findByUserId(userId);
      if (!surveys.length) {
        return res.status(404).json({ message: "No surveys found for this user" });
      }
  
      // Return the surveys
      res.json(surveys);
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: `Error fetching surveys: ${error.message}` });
    }
  };

  // Controller: Get all surveys
export const getAllSurveys = async (req, res) => {
    try {
      // Find all surveys
      const surveys = await Survey.getAllSurveys();
      if (!surveys.length) {
        return res.status(404).json({ message: "No surveys found" });
      }
  
      // Return the surveys
      res.json(surveys);
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: `Error fetching surveys: ${error.message}` });
    }
  };

  // Controller: Delete a survey
export const deleteSurvey = async (req, res) => {
    try {
      // Extract surveyId from request parameters
      const { surveyId } = req.params;
  
      // Delete the survey
      const deletedSurvey = await Survey.deleteSurvey(surveyId);
      if (!deletedSurvey) {
        return res.status(404).json({ message: "Survey not found" });
      }
  
      // Return success message
      res.json({ message: "Survey deleted successfully" });
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: `Error deleting survey: ${error.message}` });
    }
  };
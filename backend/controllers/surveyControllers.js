// import Survey from "../models/surveyModel.js";
// import User from "../models/userModel.js";


// // Controller: Create a new survey
// export const createSurvey = async (req, res) => {
//     try {
//       // Extract survey data from request body
//       const { userId, questions } = req.body;
  
//       // Validate required fields
//       if (!questions || !Array.isArray(questions) || questions.length === 0) {
//         return res.status(400).json({ message: "Questions array is required and must not be empty" });
//       }
  
//       // Verify user exists if userId is provided
//       if (userId) {
//         const user = await User.findById(userId);
//         if (!user) {
//           return res.status(404).json({ message: "User not found" });
//         }
//       }
  
//       // Validate questions array
//       for (const q of questions) {
//         if (!q.question || !q.response) {
//           return res.status(400).json({ message: "Each question must have a question and response" });
//         }
//       }
  
//       // Prepare survey data
//       const surveyData = {
//         userId,
//         questions,
//         submittedAt: new Date(),
//       };
  
//       // Create the survey
//       const survey = await Survey.createSurvey(surveyData);
  
//       // Return the created survey
//       res.status(201).json(survey);
//     } catch (error) {
//       // Handle errors (e.g., validation errors)
//       res.status(500).json({ message: `Error creating survey: ${error.message}` });
//     }
//   };

//   // Controller: Get surveys by userId
// export const getSurveysByUser = async (req, res) => {
//     try {
//       // Extract userId from request parameters
//       const { userId } = req.params;
  
//       // Find surveys by userId
//       const surveys = await Survey.findByUserId(userId);
//       if (!surveys.length) {
//         return res.status(404).json({ message: "No surveys found for this user" });
//       }
  
//       // Return the surveys
//       res.json(surveys);
//     } catch (error) {
//       // Handle errors
//       res.status(500).json({ message: `Error fetching surveys: ${error.message}` });
//     }
//   };

//   // Controller: Get all surveys
// export const getAllSurveys = async (req, res) => {
//     try {
//       // Find all surveys
//       const surveys = await Survey.getAllSurveys();
//       if (!surveys.length) {
//         return res.status(404).json({ message: "No surveys found" });
//       }
  
//       // Return the surveys
//       res.json(surveys);
//     } catch (error) {
//       // Handle errors
//       res.status(500).json({ message: `Error fetching surveys: ${error.message}` });
//     }
//   };

//   // Controller: Delete a survey
// export const deleteSurvey = async (req, res) => {
//     try {
//       // Extract surveyId from request parameters
//       const { surveyId } = req.params;
  
//       // Delete the survey
//       const deletedSurvey = await Survey.deleteSurvey(surveyId);
//       if (!deletedSurvey) {
//         return res.status(404).json({ message: "Survey not found" });
//       }
  
//       // Return success message
//       res.json({ message: "Survey deleted successfully" });
//     } catch (error) {
//       // Handle errors
//       res.status(500).json({ message: `Error deleting survey: ${error.message}` });
//     }
//   };

import Survey from "../models/surveyModel.js";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// Helper function to get __dirname in ES modules
const getDirName = (metaUrl) => {
  const __filename = fileURLToPath(metaUrl);
  return path.dirname(__filename);
};

// Controller: Create a new survey
export const createSurvey = async (req, res) => {
  try {
    // Extract survey data from request body
    const { userId, postId, questions } = req.body;

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

    // Verify post exists if postId is provided
    if (postId) {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
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
      postId,
      questions,
      submittedAt: new Date(),
    };

    // Create the survey
    const survey = await Survey.createSurvey(surveyData);

    // Trigger survey processing
    const __dirname = getDirName(import.meta.url);
    const pythonScriptPath = path.join(__dirname, '../../python/venv/Scripts/process_surveys.py');
    const pythonExecutable = path.join(__dirname, '../../python/venv/Scripts/python.exe');

    console.log('Executing survey processing command:', `"${pythonExecutable}" "${pythonScriptPath}" "${survey._id}"`);

    const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, survey._id.toString()]);

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    const surveySummaryPromise = new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0 && stdoutData.trim()) {
          try {
            // Parse JSON output from Python script
            const summary = JSON.parse(stdoutData);
            resolve(summary);
          } catch (err) {
            console.error('Error parsing survey summary:', err);
            reject(new Error('Failed to parse survey summary'));
          }
        } else {
          console.error('Survey processing script error:', stderrData);
          reject(new Error(`Survey processing failed: ${stderrData}`));
        }
      });
    });

    // Wait for survey processing to complete
    const surveySummary = await surveySummaryPromise;

    // Return the created survey and summary
    res.status(201).json({ survey, surveySummary });
  } catch (error) {
    // Handle errors
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
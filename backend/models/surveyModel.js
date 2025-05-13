// // Import mongoose to define the schema and interact with MongoDB
// import mongoose from "mongoose";

// // Define the survey schema using mongoose.Schema
// const surveySchema = new mongoose.Schema({
//   // UserId field: references the User model, optional (for anonymous surveys)
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User", // Links to the User collection
//   },
//   // Questions field: array of question-response pairs
//   questions: [
//     {
//       // Question field: the survey question text
//       question: {
//         type: String,
//         required: [true, "Question is required"],
//         trim: true, // Remove whitespace
//       },
//       // Response field: the user’s answer
//       response: {
//         type: String,
//         required: [true, "Response is required"],
//         trim: true, // Remove whitespace
//       },
//     },
//   ],
//   // SubmittedAt field: timestamp of when the survey was submitted
//   submittedAt: {
//     type: Date,
//     default: Date.now, // Set to current timestamp
//   },
// });

// // Index on userId and submittedAt for efficient querying
// surveySchema.index({ userId: 1, submittedAt: -1 }); // Sort by submittedAt descending

// // Static method: Create a new survey
// surveySchema.statics.createSurvey = async function (surveyData) {
//     // Create a new survey document with the provided data
//     const survey = new this(surveyData);
//     // Save the survey to the database and return the result
//     return await survey.save();
//   };

//   // Static method: Find surveys by userId
// surveySchema.statics.findByUserId = async function (userId) {
//     // Find all surveys for a given userId, sorted by submittedAt descending
//     return await this.find({ userId }).sort({ submittedAt: -1 });
//   };

//   // Static method: Get all surveys
// surveySchema.statics.getAllSurveys = async function () {
//     // Find all surveys, sorted by submittedAt descending
//     return await this.find().sort({ submittedAt: -1 });
//   };

//   // Static method: Delete a survey
// surveySchema.statics.deleteSurvey = async function (surveyId) {
//     // Find and delete the survey by ID
//     return await this.findByIdAndDelete(surveyId);
//   };

//   // Instance method: Add a question-response pair
// surveySchema.methods.addQuestion = async function (question, response) {
//     // Push a new question-response pair to the questions array
//     this.questions.push({ question, response });
//     // Save the updated document
//     return await this.save();
//   };

//   // Create the Survey model from the schema
// const Survey = mongoose.model("Survey", surveySchema, "surveys_collection");

// // Export the Survey model for use in other parts of the application
// export default Survey;


import mongoose from "mongoose";

// Define the survey schema using mongoose.Schema
const surveySchema = new mongoose.Schema({
  // UserId field: references the User model, optional (for anonymous surveys)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links to the User collection
  },
  // PostId field: references the Post model, optional
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post", // Links to the Post collection
  },
  // Questions field: array of question-response pairs
  questions: [
    {
      // Question field: the survey question text
      question: {
        type: String,
        required: [true, "Question is required"],
        trim: true, // Remove whitespace
      },
      // Response field: the user’s answer
      response: {
        type: String,
        required: [true, "Response is required"],
        trim: true, // Remove whitespace
      },
    },
  ],
  // SubmittedAt field: timestamp of when the survey was submitted
  submittedAt: {
    type: Date,
    default: Date.now, // Set to current timestamp
  },
});

// Index on userId, postId, and submittedAt for efficient querying
surveySchema.index({ userId: 1, postId: 1, submittedAt: -1 }); // Sort by submittedAt descending

// Static method: Create a new survey
surveySchema.statics.createSurvey = async function (surveyData) {
  // Create a new survey document with the provided data
  const survey = new this(surveyData);
  // Save the survey to the database and return the result
  return await survey.save();
};

// Static method: Find surveys by userId
surveySchema.statics.findByUserId = async function (userId) {
  // Find all surveys for a given userId, sorted by submittedAt descending
  return await this.find({ userId }).sort({ submittedAt: -1 });
};

// Static method: Find surveys by postId
surveySchema.statics.findByPostId = async function (postId) {
  // Find all surveys for a given postId, sorted by submittedAt descending
  return await this.find({ postId }).sort({ submittedAt: -1 });
};

// Static method: Get all surveys
surveySchema.statics.getAllSurveys = async function () {
  // Find all surveys, sorted by submittedAt descending
  return await this.find().sort({ submittedAt: -1 });
};

// Static method: Delete a survey
surveySchema.statics.deleteSurvey = async function (surveyId) {
  // Find and delete the survey by ID
  return await this.findByIdAndDelete(surveyId);
};

// Instance method: Add a question-response pair
surveySchema.methods.addQuestion = async function (question, response) {
  // Push a new question-response pair to the questions array
  this.questions.push({ question, response });
  // Save the updated document
  return await this.save();
};

// Create the Survey model from the schema
const Survey = mongoose.model("Survey", surveySchema, "surveys_collection");

// Export the Survey model for use in other parts of the application
export default Survey;
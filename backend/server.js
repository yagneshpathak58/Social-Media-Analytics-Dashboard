import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import userRoutes from "./routes/userRoute.js";
import postRoutes from "./routes/postRoute.js";
import surveysRoute from "./routes/surveysRoute.js";
import analyticsRoute from "./routes/analyticsRoute.js";

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

//Connect to MongoDB
db();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/surveys", surveysRoute);

app.use("/api/analytics", analyticsRoute);

app.listen(process.env.PORT, () =>{
    console.log(`Server is running on port ${process.env.PORT}`);
});


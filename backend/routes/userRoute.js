import express from "express";
import { addSocialMediaAccount, getAllUsers, getUserById, handleSocialCallback, initiateTwitterOAuth, loginUser, registerUser, removeSocialMediaAccount, updateUser } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/users/register - Register a new user
//http://localhost:5000/api/users/register
/*{
  "email": "vaishnavivyas1610@gmail.com",
  "password": "Password123@",
  "name": "Vaishnavi Vyas"
} */
router.post("/register", registerUser);

//POST /api/users/login - Login a user
//http://localhost:5000/api/users/login
/*
{
    "email":"vaishnavivyas1610@gmail.com",
    "password":"Password123@"
} 
*/
router.post("/login",loginUser)

// GET /api/users/initiate-twitter-oauth - Initiate Twitter OAuth
// http://localhost:5000/api/users/initiate-twitter-oauth
router.get("/initiate-twitter-oauth", initiateTwitterOAuth);

// GET /api/users/social-callback - Handle OAuth callback
// http://localhost:5000/api/users/social-callback
router.get("/social-callback", handleSocialCallback);

// GET /api/users/:id - Get user details by ID
//http://localhost:5000/api/users/<user_id>
router.get("/:id", getUserById);

// PUT /api/users/:id - Update user details
//http://localhost:5000/api/users/<user_id>
/*
{"name":"Rahul Doshi"}
*/ 
router.put("/:id", authMiddleware, updateUser);

// POST /api/users/social-account - Add a social media account
// http://localhost:5000/api/users/social-account
/*
{
  "userId": "<user_id>",
  "platform": "Twitter"
}
*/
router.post("/social-account", authMiddleware, addSocialMediaAccount);

// GET /api/users/initiate-twitter-oauth - Initiate Twitter OAuth
// http://localhost:5000/api/users/initiate-twitter-oauth
// router.get("/initiate-twitter-oauth", initiateTwitterOAuth);



// DELETE /api/users/social-account - Remove a social media account
// http://localhost:5000/api/users/social-account
/*
{
  "userId": "user_id",
  "platform": "platform_name",
  "username": "username"
} 
*/
router.delete("/social-account", authMiddleware, removeSocialMediaAccount);

// GET /api/users - Get all users
// http://localhost:5000/api/users/
router.get("/", getAllUsers);
export default router;
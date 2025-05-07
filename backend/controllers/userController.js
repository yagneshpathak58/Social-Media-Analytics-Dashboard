import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fetch from "node-fetch"; // for making HTTP requests
import crypto from "crypto"; // For generating state parameter
import { TwitterApi } from "twitter-api-v2";



// Load environment variables from .env file
dotenv.config();

// Initialize Twitter client
const twitterClient = new TwitterApi({
clientId: process.env.TWITTER_API_KEY,
clientSecret: process.env.TWITTER_API_SECRET,
});

//Controller: Register a new user
export const registerUser = async (req, res) =>{
try
{
    // Extract email, password, and name from request body
    const {email, password, name} = req.body;

    // Validate input: ensure all required fields are provided
    if(!email || !password || !name)
    {
        return res.status(400).json({message:"All fields are required"});
    }

    // Check if user already exists by email
    const existingUser = await User.findByEmail(email);

    if(existingUser)
    {
        return res.status(400).json({message:"User already exists"});
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 8);

    // Prepare user data for creation
    const userData = {
        email,
        password: hashedPassword,
        name: name,
    };

    // Create the user using the User model's static method
    const user = await User.createUser(userData);

    // Generate a JWT token for the new user
    const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn:"1h"});

    //Return success response with token and user details
    res.status(201).json({

        token,
        user:{
            id:user._id,
            email:user.email,
            name:user.name,
            socialMediaAccounts: user.socialMediaAccounts,
        },

    });

}
catch(error)
{
    // Handle any errors (e.g., database errors, validation errors)
    res.status(500).json({ message: `Error registering user: ${error.message}` });

}
};

//Controller: Login a user
export const loginUser = async(req, res) =>{

try
{
    console.log(req.body);
    // Extract email and password from request body
    const {email, password} = req.body;

    //validate input: ensure email and password are provided
    if(!email || !password)
    {
        return res.status(400).json({message:"Email and password are required"});
    }
    
    // Check if user exists by email
    const user = await User.findByEmail(email);

    if(!user)
    {
        console.log(user);
        return res.status(401).json({message:"Invalid email or password"});
        
    }

    // Compare provided password with hashed password in the database
    const ismatch = await bcrypt.compare(password, user.password);

    if(!ismatch)
    {
        console.log(user);
        return res.status(401).json({message:"Invalid email or password"});
    }

    // Generate a JWT token for the user
    const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn:"1h"});

    // Return success response with token and user details
    res.status(201).json({

        token,
        user:{
            id:user._id,
            email:user.email,
            name:user.name,
            socialMediaAccounts: user.socialMediaAccounts,
        },
        
    });
}
catch(error)
{
    // Handle any errors (e.g., database errors, validation errors)
    res.status(500).json({ message: `Error logging in user: ${error.message}` });
}
};

// Controller: Get user details by ID
export const getUserById = async (req, res) => {
try {
  // Extract userId from request parameters (e.g., /api/users/:id)
  const { id } = req.params;

  // Find user by ID
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Return user details (exclude password for security)
  res.json({
    id: user._id,
    email: user.email,
    name: user.name,
    socialMediaAccounts: user.socialMediaAccounts,
    createdAt: user.createdAt,
  });
} catch (error) {
  // Handle any errors (e.g., invalid ID format, database errors)
  res.status(500).json({ message: `Error fetching user: ${error.message}` });
}
};

// Controller: Update user details
export const updateUser = async (req, res) => {
try {
  // Extract userId from request parameters
  const { id } = req.params;
  // Extract updated fields from request body
  const { email, name } = req.body;

  // Validate input: ensure at least one field is provided
  if (!email && !name) {
    return res.status(400).json({ message: "No fields provided for update" });
  }

  // Prepare update data
  const updateData = {};
  if (email) updateData.email = email;
  if (name) updateData.name = name;

  // Update the user using the User model's static method
  const updatedUser = await User.updateUser(id, updateData);
  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // Return updated user details
  res.json({
    id: updatedUser._id,
    email: updatedUser.email,
    name: updatedUser.name,
    socialMediaAccounts: updatedUser.socialMediaAccounts,
  });
} catch (error) {
  // Handle any errors (e.g., duplicate email, validation errors)
  res.status(500).json({ message: `Error updating user: ${error.message}` });
}
};

// Controller: Add a social media account
export const addSocialMediaAccount = async (req, res) => {
try {
// Extract userId and platform from request body
const { userId, platform } = req.body;

// Validate input
if (!userId || !platform) {
  return res
    .status(400)
    .json({ message: "User ID and platform are required" });
}

// Validate platform
const validPlatforms = ["Twitter", "Instagram", "Facebook"];
if (!validPlatforms.includes(platform)) {
  return res.status(400).json({ message: "Invalid platform" });
}

// Generate a state parameter for security (to prevent CSRF)
const state = crypto.randomBytes(16).toString("hex");

// Generate OAuth URL based on platform
let oauthUrl;
if (platform === "Twitter") {
  oauthUrl = `/api/users/initiate-twitter-oauth?userId=${userId}&state=${state}`;
} else if (platform === "Instagram") {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_CALLBACK_URL;
  oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${state}&scope=instagram_basic,instagram_manage_insights`;
} else if (platform === "Facebook") {
  const appId = process.env.FACEBOOK_APP_ID;
  const redirectUri = process.env.FACEBOOK_CALLBACK_URL;
  oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${state}&scope=pages_show_list,pages_read_engagement`;
}

// Return OAuth URL for client to redirect
res.json({ oauthUrl });
} catch (error) {
res.status(500).json({ message: `Error initiating OAuth: ${error.message}` });
}
};

// Controller: Initiate Twitter OAuth
export const initiateTwitterOAuth = async (req, res) => {
  try {
    const { userId, state } = req.query;

    if (!userId || !state) {
      return res.status(400).json({ message: "User ID and state are required" });
    }

    // Generate a code verifier and challenge for PKCE
    const codeVerifier = crypto.randomBytes(32).toString("hex");
    const codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Generate OAuth 2.0 URL for Twitter using generateOAuth2AuthLink
    const authLink = twitterClient.generateOAuth2AuthLink(
      process.env.TWITTER_CALLBACK_URL,
      {
        scope: ["tweet.read", "users.read", "offline.access"],
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      }
    );

    // Store userId, state, and codeVerifier in database for callback verification
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          twitter_oauth: { state, userId, codeVerifier },
        },
      }
    );

    // Redirect to Twitter's auth URL
    res.redirect(authLink.url);
  } catch (error) {
    res.status(500).json({ message: `Error initiating Twitter OAuth: ${error.message}` });
  }
};

// Controller: Handle social media callback
export const handleSocialCallback = async (req, res) => {
try {
// Extract query parameters
const { state, code, error, error_description } = req.query;

// Handle OAuth errors
if (error) {
  return res.status(400).json({ message: `OAuth error: ${error_description || error}` });
}

// Validate state
if (!state) {
  return res.status(400).json({ message: "Missing state parameter" });
}

// Find user by state
const user = await User.findOne({ "twitter_oauth.state": state });
if (!user || !user.twitter_oauth) {
  return res.status(400).json({ message: "Invalid state or user not found" });
}

const userId = user.twitter_oauth.userId;
const codeVerifier = user.twitter_oauth.codeVerifier;

let platform = "Twitter"; // Default to Twitter for this flow
let accountData;

if (platform === "Twitter" && code) {
  // Exchange code for access token
  const tokenResponse = await twitterClient.loginWithOAuth2({
    code,
    codeVerifier,
    redirectUri: process.env.TWITTER_CALLBACK_URL,
  });

  const accessToken = tokenResponse.accessToken;

  // Fetch user info
  const client = new TwitterApi(accessToken);
  const userInfo = await client.v2.me({ "user.fields": "username" });
  const username = userInfo.data.username;

  accountData = {
    platform: "Twitter",
    username,
    accessToken,
  };
} else if (platform === "Instagram" && code) {
  // Exchange code for Instagram access token
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_CALLBACK_URL;

  const tokenResponse = await fetch(
    `https://api.instagram.com/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }),
    }
  );

  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    return res.status(400).json({ message: tokenData.error.message });
  }

  const accessToken = tokenData.access_token;
  const instagramUserId = tokenData.user_id;

  // Fetch username using Instagram Graph API
  const userResponse = await fetch(
    `https://graph.instagram.com/${instagramUserId}?fields=username&access_token=${accessToken}`
  );
  const userData = await userResponse.json();
  if (userData.error) {
    return res.status(400).json({ message: userData.error.message });
  }

  accountData = {
    platform: "Instagram",
    username: userData.username,
    accessToken,
  };
} else if (platform === "Facebook" && code) {
  // Exchange code for Facebook access token
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = process.env.FACEBOOK_CALLBACK_URL;

  const tokenResponse = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`
  );

  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    return res.status(400).json({ message: tokenData.error.message });
  }

  const accessToken = tokenData.access_token;

  // Fetch user's pages to get page username
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
  );
  const pagesData = await pagesResponse.json();
  if (pagesData.error || !pagesData.data.length) {
    return res.status(400).json({ message: "No pages found or error" });
  }

  const page = pagesData.data[0]; // Use first page
  accountData = {
    platform: "Facebook",
    username: page.name,
    accessToken: page.access_token,
  };
} else {
  return res.status(400).json({ message: "Invalid callback parameters" });
}

// Update user's socialMediaAccounts
const updatedUser = await User.findByIdAndUpdate(
  userId,
  { $push: { socialMediaAccounts: accountData } },
  { new: true }
);
if (!updatedUser) {
  return res.status(404).json({ message: "User not found" });
}

// Clean up temporary oauth data
await User.updateOne({ _id: userId }, { $unset: { twitter_oauth: "" } });

// Redirect to frontend success page
res.redirect("http://localhost:3000/social-media-success");
} catch (error) {
res.status(500).json({ message: `Error handling callback: ${error.message}` });
}
};

// Controller: Remove a social media account
export const removeSocialMediaAccount = async (req, res) => {
try {
  // Extract userId, platform, and username from request body
  const { userId, platform, username } = req.body;

  // Validate input: ensure all required fields are provided
  if (!userId || !platform || !username) {
    return res
      .status(400)
      .json({ message: "User ID, platform, and username are required" });
  }

  // Remove the social media account using the User model's static method
  const updatedUser = await User.removeSocialMediaAccount(
    userId,
    platform,
    username
  );
  if (!updatedUser) {
    return res.status(404).json({ message: "User or account not found" });
  }

  // Return updated user details
  res.json({
    id: updatedUser._id,
    email: updatedUser.email,
    name: updatedUser.name,
    socialMediaAccounts: updatedUser.socialMediaAccounts,
  });
} catch (error) {
  // Handle any errors (e.g., database errors)
  res.status(500).json({ message: `Error removing account: ${error.message}` });
}
};

// Controller: Get all users (admin only)
export const getAllUsers = async (req, res) => {
try {
  // Fetch all users using the User model's static method
  const users = await User.getAllUsers();

  // Return array of users (exclude passwords for security)
  res.json(
    users.map((user) => ({
      id: user._id,
      email: user.email,
      name: user.name,
      socialMediaAccounts: user.socialMediaAccounts,
      createdAt: user.createdAt,
    }))
  );
} catch (error) {
  // Handle any errors (e.g., database errors)
  res.status(500).json({ message: `Error fetching users: ${error.message}` });
}
};
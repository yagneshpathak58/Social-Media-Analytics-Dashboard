// import User from "../models/userModel.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import fetch from "node-fetch"; // for making HTTP requests
// import crypto from "crypto"; // For generating state parameter
// import { TwitterApi } from "twitter-api-v2";

// // Load environment variables from .env file
// dotenv.config();

// // Validate environment variables
// if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
//   console.error("Error: TWITTER_API_KEY or TWITTER_API_SECRET is missing in .env");
//   process.exit(1);
// }
// if (!process.env.TWITTER_CALLBACK_URL) {
//   console.error("Error: TWITTER_CALLBACK_URL is missing in .env");
//   process.exit(1);
// }

// // Log client credentials for debugging (remove in production)
// console.log("TWITTER_API_KEY:", process.env.TWITTER_API_KEY);
// console.log("TWITTER_API_SECRET:", process.env.TWITTER_API_SECRET ? "[REDACTED]" : "MISSING");
// console.log("TWITTER_CALLBACK_URL:", process.env.TWITTER_CALLBACK_URL);

// // Generate and log Authorization header for debugging
// const authHeader = `Basic ${Buffer.from(
//   `${process.env.TWITTER_API_KEY}:${process.env.TWITTER_API_SECRET}`
// ).toString("base64")}`;
// console.log("Authorization Header (partial):", authHeader.substring(0, 10) + "...");

// // Initialize Twitter client
// const twitterClient = new TwitterApi({
//   clientId: process.env.TWITTER_API_KEY,
//   clientSecret: process.env.TWITTER_API_SECRET,
// });

// // Function to generate a valid PKCE code verifier
// function generateCodeVerifier() {
//   const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
//   const length = 64; // Between 43 and 128 characters
//   let result = "";
//   const bytes = crypto.randomBytes(length);
//   for (let i = 0; i < length; i++) {
//     result += charset[bytes[i] % charset.length];
//   }
//   return result;
// }

// // Function to generate code challenge from code verifier
// function generateCodeChallenge(codeVerifier) {
//   return crypto
//     .createHash("sha256")
//     .update(codeVerifier)
//     .digest("base64")
//     .replace(/\+/g, "-")
//     .replace(/\//g, "_")
//     .replace(/=+$/, "");
// }

// //Controller: Register a new user
// export const registerUser = async (req, res) =>{
// try
// {
//     // Extract email, password, and name from request body
//     const {email, password, name} = req.body;

//     // Validate input: ensure all required fields are provided
//     if(!email || !password || !name)
//     {
//         return res.status(400).json({message:"All fields are required"});
//     }

//     // Check if user already exists by email
//     const existingUser = await User.findByEmail(email);

//     if(existingUser)
//     {
//         return res.status(400).json({message:"User already exists"});
//     }

//     // Hash password using bcrypt
//     const hashedPassword = await bcrypt.hash(password, 8);

//     // Prepare user data for creation
//     const userData = {
//         email,
//         password: hashedPassword,
//         name: name,
//     };

//     // Create the user using the User model's static method
//     const user = await User.createUser(userData);

//     // Generate a JWT token for the new user
//     const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn:"1h"});

//     //Return success response with token and user details
//     res.status(201).json({

//         token,
//         user:{
//             id:user._id,
//             email:user.email,
//             name:user.name,
//             socialMediaAccounts: user.socialMediaAccounts,
//         },

//     });

// }
// catch(error)
// {
//     // Handle any errors (e.g., database errors, validation errors)
//     res.status(500).json({ message: `Error registering user: ${error.message}` });

// }
// };

// //Controller: Login a user
// export const loginUser = async(req, res) =>{

// try
// {
//     console.log(req.body);
//     // Extract email and password from request body
//     const {email, password} = req.body;

//     //validate input: ensure email and password are provided
//     if(!email || !password)
//     {
//         return res.status(400).json({message:"Email and password are required"});
//     }

//     // Check if user exists by email
//     const user = await User.findByEmail(email);

//     if(!user)
//     {
//         console.log(user);
//         return res.status(401).json({message:"Invalid email or password"});

//     }

//     // Compare provided password with hashed password in the database
//     const ismatch = await bcrypt.compare(password, user.password);

//     if(!ismatch)
//     {
//         console.log(user);
//         return res.status(401).json({message:"Invalid email or password"});
//     }

//     // Generate a JWT token for the user
//     const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn:"1h"});

//     // Return success response with token and user details
//     res.status(201).json({

//         token,
//         user:{
//             id:user._id,
//             email:user.email,
//             name:user.name,
//             socialMediaAccounts: user.socialMediaAccounts,
//         },

//     });
// }
// catch(error)
// {
//     // Handle any errors (e.g., database errors, validation errors)
//     res.status(500).json({ message: `Error logging in user: ${error.message}` });
// }
// };

// // Controller: Get user details by ID
// export const getUserById = async (req, res) => {
// try {
//   // Extract userId from request parameters (e.g., /api/users/:id)
//   const { id } = req.params;

//   // Find user by ID
//   const user = await User.findById(id);
//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   // Return user details (exclude password for security)
//   res.json({
//     id: user._id,
//     email: user.email,
//     name: user.name,
//     socialMediaAccounts: user.socialMediaAccounts,
//     createdAt: user.createdAt,
//   });
// } catch (error) {
//   // Handle any errors (e.g., invalid ID format, database errors)
//   res.status(500).json({ message: `Error fetching user: ${error.message}` });
// }
// };

// // Controller: Update user details
// export const updateUser = async (req, res) => {
// try {
//   // Extract userId from request parameters
//   const { id } = req.params;
//   // Extract updated fields from request body
//   const { email, name } = req.body;

//   // Validate input: ensure at least one field is provided
//   if (!email && !name) {
//     return res.status(400).json({ message: "No fields provided for update" });
//   }

//   // Prepare update data
//   const updateData = {};
//   if (email) updateData.email = email;
//   if (name) updateData.name = name;

//   // Update the user using the User model's static method
//   const updatedUser = await User.updateUser(id, updateData);
//   if (!updatedUser) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   // Return updated user details
//   res.json({
//     id: updatedUser._id,
//     email: updatedUser.email,
//     name: updatedUser.name,
//     socialMediaAccounts: updatedUser.socialMediaAccounts,
//   });
// } catch (error) {
//   // Handle any errors (e.g., duplicate email, validation errors)
//   res.status(500).json({ message: `Error updating user: ${error.message}` });
// }
// };

// // Controller: Add a social media account
// export const addSocialMediaAccount = async (req, res) => {
// try {
// // Extract userId and platform from request body
// const { userId, platform } = req.body;

// // Validate input
// if (!userId || !platform) {
//   return res
//     .status(400)
//     .json({ message: "User ID and platform are required" });
// }

// // Validate platform
// const validPlatforms = ["Twitter", "Instagram", "Facebook"];
// if (!validPlatforms.includes(platform)) {
//   return res.status(400).json({ message: "Invalid platform" });
// }

// // Generate a state parameter for security (to prevent CSRF)
// const state = crypto.randomBytes(16).toString("hex");

// // Generate OAuth URL based on platform
// let oauthUrl;
// if (platform === "Twitter") {
//   oauthUrl = `/api/users/initiate-twitter-oauth?userId=${userId}&state=${state}`;
// } else if (platform === "Instagram") {
//   const appId = process.env.INSTAGRAM_APP_ID;
//   const redirectUri = process.env.INSTAGRAM_CALLBACK_URL;
//   oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${state}&scope=instagram_basic,instagram_manage_insights`;
// } else if (platform === "Facebook") {
//   const appId = process.env.FACEBOOK_APP_ID;
//   const redirectUri = process.env.FACEBOOK_CALLBACK_URL;
//   oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${state}&scope=pages_show_list,pages_read_engagement`;
// }

// // Return OAuth URL for client to redirect
// res.json({ oauthUrl });
// } catch (error) {
// res.status(500).json({ message: `Error initiating OAuth: ${error.message}` });
// }
// };

// // // Controller: Initiate Twitter OAuth
// // export const initiateTwitterOAuth = async (req, res) => {
// //   try {
// //     const { userId, state } = req.query;

// //     if (!userId || !state) {
// //       return res.status(400).json({ message: "User ID and state are required" });
// //     }
// //     // Log the raw query to debug
// //     console.log("Raw req.query:", req.query);

// //     // Generate a code verifier and challenge for PKCE
// //     const codeVerifier = crypto.randomBytes(32).toString("hex");
// //     const codeChallenge = crypto
// //       .createHash("sha256")
// //       .update(codeVerifier)
// //       .digest("base64")
// //       .replace(/\+/g, "-")
// //       .replace(/\//g, "_")
// //       .replace(/=+$/, "");

// //     // Generate OAuth 2.0 URL for Twitter using generateOAuth2AuthLink
// //     const authLink = twitterClient.generateOAuth2AuthLink(
// //       process.env.TWITTER_CALLBACK_URL,
// //       {
// //         scope: ["tweet.read", "users.read", "offline.access"],
// //         state,
// //         code_challenge: codeChallenge,
// //         code_challenge_method: "S256",
// //       }
// //     );

// //     // Store userId, state, and codeVerifier in database for callback verification
// //     await User.updateOne(
// //       { _id: userId },
// //       {
// //         $set: {
// //           twitter_oauth: { state, userId, codeVerifier },
// //         },
// //       },
// //       { upsert: true }
// //     );

// //     // Redirect to Twitter's auth URL
// //     res.redirect(authLink.url);
// //   } catch (error) {
// //     res.status(500).json({ message: `Error initiating Twitter OAuth: ${error.message}` });
// //   }
// // };

// // Controller: Initiate Twitter OAuth
// export const initiateTwitterOAuth = async (req, res) => {
//   try {
//     const { userId, state } = req.query;
//     if (!userId || !state) {
//       return res.status(400).json({ message: "User ID and state are required" });
//     }
//     console.log("Initiate Twitter OAuth - Raw req.query:", req.query);

//     // Validate user exists
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Generate a code verifier and challenge for PKCE
//     const codeVerifier = generateCodeVerifier();
//     const codeChallenge = generateCodeChallenge(codeVerifier);

//     console.log("Generated PKCE:", { codeVerifier, codeChallenge });

//     // // Generate a code verifier and challenge for PKCE
//     // const codeVerifier = crypto.randomBytes(32).toString("hex");
//     // const codeChallenge = crypto
//     //   .createHash("sha256")
//     //   .update(codeVerifier)
//     //   .digest("base64")
//     //   .replace(/\+/g, "-")
//     //   .replace(/\//g, "_")
//     //   .replace(/=+$/, "");

//     // Generate OAuth 2.0 URL for Twitter
//     const authLink = twitterClient.generateOAuth2AuthLink(
//       process.env.TWITTER_CALLBACK_URL,
//       {
//         scope: ["tweet.read", "users.read", "offline.access"],
//         state,
//         code_challenge: codeChallenge,
//         code_challenge_method: "S256",
//       }
//     );

//     // Store userId, state, and codeVerifier in database
//     await User.updateOne(
//       { _id: userId },
//       {
//         $set: {
//           twitter_oauth: { state, userId, codeVerifier },
//         },
//       },
//       { upsert: true }
//     );
//     console.log(`Stored OAuth data: state=${state}, userId=${userId}, codeVerifier=${codeVerifier}`);

//     // Redirect to Twitter's auth URL
//     res.redirect(authLink.url);
//   } catch (error) {
//     console.error("Error initiating Twitter OAuth:", error);
//     res.status(500).json({ message: `Error initiating Twitter OAuth: ${error.message}` });
//   }
// };

// // // Controller: Handle social media callback
// // export const handleSocialCallback = async (req, res) => {
// //   try {
// //     // Extract query parameters
// //     const { state, code, error, error_description } = req.query;

// //     // Handle OAuth errors
// //     if (error) {
// //       return res.status(400).json({ message: `OAuth error: ${error_description || error}` });
// //     }

// //     // Validate state
// //     if (!state) {
// //       return res.status(400).json({ message: "Missing state parameter" });
// //     }

// //     console.log("Callback state from query:", state);
// //     // Find user by state
// //     const user = await User.findOne({ "twitter_oauth.state": state });
// //     console.log("Found user twitter_oauth:", user ? user.twitter_oauth : "null");
// //     if (!user || !user.twitter_oauth) {
// //       return res.status(400).json({ message: "Invalid state or user not found" });
// //     }

// //     const userId = String(user.twitter_oauth.userId);
// //     console.log("Callback userId:", userId, "Type:", typeof userId);
// //     const codeVerifier = user.twitter_oauth.codeVerifier;
// //     console.log("Callback codeVerifier:", codeVerifier);

// //     let platform = "Twitter"; // Default to Twitter for this flow
// //     let accountData;

// //     if (platform === "Twitter" && code) {
// //       // Log details for debugging
// //       console.log("Callback code:", code);
// //       console.log("Callback redirectUri:", process.env.TWITTER_CALLBACK_URL);
// //       console.log("Client ID used:", process.env.TWITTER_API_KEY);
// //       // Exchange code for access token
// //       try {
// //         const tokenResponse = await twitterClient.loginWithOAuth2({
// //           code,
// //           codeVerifier,
// //           redirectUri: process.env.TWITTER_CALLBACK_URL,
// //         });
// //         const accessToken = tokenResponse.accessToken;
// //         console.log("Access token received:", accessToken);

// //         // Fetch user info
// //         const client = new TwitterApi(accessToken);
// //         const userInfo = await client.v2.me({ "user.fields": "username" });
// //         const username = userInfo.data.username;

// //         accountData = {
// //           platform: "Twitter",
// //           username,
// //           accessToken,
// //         };
// //       } catch (tokenError) {
// //         console.log("Twitter token error details:", tokenError.response?.data || tokenError);
// //         throw new Error(`Twitter token exchange failed: ${tokenError.message}`);
// //       }
// //     } else if (platform === "Instagram" && code) {
// //       // Exchange code for Instagram access token
// //       const appId = process.env.INSTAGRAM_APP_ID;
// //       const appSecret = process.env.INSTAGRAM_APP_SECRET;
// //       const redirectUri = process.env.INSTAGRAM_CALLBACK_URL;

// //       const tokenResponse = await fetch(
// //         `https://api.instagram.com/oauth/access_token`,
// //         {
// //           method: "POST",
// //           headers: { "Content-Type": "application/x-www-form-urlencoded" },
// //           body: new URLSearchParams({
// //             client_id: appId,
// //             client_secret: appSecret,
// //             grant_type: "authorization_code",
// //             redirect_uri: redirectUri,
// //             code,
// //           }),
// //         }
// //       );

// //       const tokenData = await tokenResponse.json();
// //       if (tokenData.error) {
// //         return res.status(400).json({ message: tokenData.error.message });
// //       }

// //       const accessToken = tokenData.access_token;
// //       const instagramUserId = tokenData.user_id;

// //       // Fetch username using Instagram Graph API
// //       const userResponse = await fetch(
// //         `https://graph.instagram.com/${instagramUserId}?fields=username&access_token=${accessToken}`
// //       );
// //       const userData = await userResponse.json();
// //       if (userData.error) {
// //         return res.status(400).json({ message: userData.error.message });
// //       }

// //       accountData = {
// //         platform: "Instagram",
// //         username: userData.username,
// //         accessToken,
// //       };
// //     } else if (platform === "Facebook" && code) {
// //       // Exchange code for Facebook access token
// //       const appId = process.env.FACEBOOK_APP_ID;
// //       const appSecret = process.env.FACEBOOK_APP_SECRET;
// //       const redirectUri = process.env.FACEBOOK_CALLBACK_URL;

// //       const tokenResponse = await fetch(
// //         `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`
// //       );

// //       const tokenData = await tokenResponse.json();
// //       if (tokenData.error) {
// //         return res.status(400).json({ message: tokenData.error.message });
// //       }

// //       const accessToken = tokenData.access_token;

// //       // Fetch user's pages to get page username
// //       const pagesResponse = await fetch(
// //         `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
// //       );
// //       const pagesData = await pagesResponse.json();
// //       if (pagesData.error || !pagesData.data.length) {
// //         return res.status(400).json({ message: "No pages found or error" });
// //       }

// //       const page = pagesData.data[0]; // Use first page
// //       accountData = {
// //         platform: "Facebook",
// //         username: page.name,
// //         accessToken: page.access_token,
// //       };
// //     } else {
// //       return res.status(400).json({ message: "Invalid callback parameters" });
// //     }

// //     // Update user's socialMediaAccounts
// //     const updatedUser = await User.findByIdAndUpdate(
// //       userId,
// //       { $push: { socialMediaAccounts: accountData } },
// //       { new: true }
// //     );
// //     if (!updatedUser) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     // Clean up temporary oauth data
// //     await User.updateOne({ _id: userId }, { $unset: { twitter_oauth: "" } });

// //     // Redirect to frontend success page
// //     res.redirect("http://localhost:3000/social-media-success");
// //   } catch (error) {
// //     res.status(500).json({ message: `Error handling callback: ${error.message}` });
// //   }
// // };

// // Controller: Handle social media callback
// export const handleSocialCallback = async (req, res) => {
//   try {
//     const { state, code, error, error_description} = req.query;
//     console.log("Callback - Raw req.query:", req.query);

//     // Handle OAuth errors
//     if (error) {
//       return res.status(400).json({ message: `OAuth error: ${error_description || error}` });
//     }

//     // Validate state
//     if (!state || !code) {
//       return res.status(400).json({ message: "Missing state or code parameter" });
//     }

//     // Find user by state
//     const user = await User.findOne({ "twitter_oauth.state": state });
//     console.log("Found user twitter_oauth:", user ? user.twitter_oauth : "null");
//     if (!user || !user.twitter_oauth) {
//       return res.status(400).json({ message: "Invalid state or user not found" });
//     }

//     const storedUserId = String(user.twitter_oauth.userId);
//     const codeVerifier = user.twitter_oauth.codeVerifier;
//     console.log("Callback userId:", storedUserId, "Type:", typeof storedUserId);
//     console.log("Callback codeVerifier:", codeVerifier);
//     console.log("Callback code:", code);
//     console.log("Callback redirectUri:", process.env.TWITTER_CALLBACK_URL);

//     let platform = "Twitter";
//     let accountData;

//     if (platform === "Twitter" && code) {
//       try {
//         // Log token exchange inputs
//         console.log("Initiating Twitter token exchange with inputs:", {
//           code: code.substring(0, 10) + "...",
//           codeVerifier: codeVerifier.substring(0, 10) + "...",
//           redirectUri: process.env.TWITTER_CALLBACK_URL,
//           clientId: process.env.TWITTER_API_KEY,
//         });

//         // Attempt token exchange using twitter-api-v2
//         const tokenResponse = await twitterClient.loginWithOAuth2({
//           code,
//           codeVerifier,
//           redirectUri: process.env.TWITTER_CALLBACK_URL,
//         });

//         const accessToken = tokenResponse.accessToken;
//         console.log("Access token received:", accessToken.substring(0, 10) + "...");

//         // Fetch user info
//         const client = new TwitterApi(accessToken);
//         const userInfo = await client.v2.me({ "user.fields": "username" });
//         const username = userInfo.data.username;
//         console.log("Twitter user info:", { username });

//         accountData = {
//           platform: "Twitter",
//           username,
//           accessToken,
//         };
//       } catch (tokenError) {
//         console.error("Twitter token exchange error:", {
//           message: tokenError.message,
//           response: tokenError.response ? tokenError.response.data : null,
//           stack: tokenError.stack,
//         });
//         throw new Error(`Twitter token exchange failed: ${tokenError.message}`);
//       }

//       //   // Fallback: Manual token exchange to debug
//       //   console.log("Attempting manual token exchange...");
//       //   const authHeader = `Basic ${Buffer.from(
//       //     `${process.env.TWITTER_API_KEY}:${process.env.TWITTER_API_SECRET}`
//       //   ).toString("base64")}`;
//       //   const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
//       //     method: "POST",
//       //     headers: {
//       //       "Content-Type": "application/x-www-form-urlencoded",
//       //       Authorization: authHeader,
//       //     },
//       //     body: new URLSearchParams({
//       //       grant_type: "authorization_code",
//       //       code,
//       //       redirect_uri: process.env.TWITTER_CALLBACK_URL,
//       //       client_id: process.env.TWITTER_API_KEY,
//       //       code_verifier: codeVerifier,
//       //     }),
//       //   });

//       //   const tokenData = await tokenResponse.json();
//       //   if (!tokenResponse.ok) {
//       //     console.error("Manual token exchange failed:", tokenData);
//       //     throw new Error(`Manual token exchange failed: ${JSON.stringify(tokenData)}`);
//       //   }

//       //   const accessToken = tokenData.access_token;
//       //   console.log("Manual access token received:", accessToken.substring(0, 10) + "...");

//       //   // Fetch user info
//       //   const client = new TwitterApi(accessToken);
//       //   const userInfo = await client.v2.me({ "user.fields": "username" });
//       //   const username = userInfo.data.username;
//       //   console.log("Twitter user info (manual):", { username });

//       //   accountData = {
//       //     platform: "Twitter",
//       //     username,
//       //     accessToken,
//       //   };
//       // }
//     // } else if (platform === "Instagram" && code) {
//     //   const appId = process.env.INSTAGRAM_APP_ID;
//     //   const appSecret = process.env.INSTAGRAM_APP_SECRET;
//     //   const redirectUri = process.env.INSTAGRAM_CALLBACK_URL;
//     //   const tokenResponse = await fetch(`https://api.instagram.com/oauth/access_token`, {
//     //     method: "POST",
//     //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     //     body: new URLSearchParams({
//     //       client_id: appId,
//     //       client_secret: appSecret,
//     //       grant_type: "authorization_code",
//     //       redirect_uri: redirectUri,
//     //       code,
//     //     }),
//     //   });
//     //   const tokenData = await tokenResponse.json();
//     //   if (tokenData.error) {
//     //     return res.status(400).json({ message: tokenData.error.message });
//     //   }
//     //   const accessToken = tokenData.access_token;
//     //   const instagramUserId = tokenData.user_id;
//     //   const userResponse = await fetch(
//     //     `https://graph.instagram.com/${instagramUserId}?fields=username&access_token=${accessToken}`
//     //   );
//     //   const userData = await userResponse.json();
//     //   if (userData.error) {
//     //     return res.status(400).json({ message: userData.error.message });
//     //   }
//     //   accountData = {
//     //     platform: "Instagram",
//     //     username: userData.username,
//     //     accessToken,
//     //   };
//     // } else if (platform === "Facebook" && code) {
//     //   const appId = process.env.FACEBOOK_APP_ID;
//     //   const appSecret = process.env.FACEBOOK_APP_SECRET;
//     //   const redirectUri = process.env.FACEBOOK_CALLBACK_URL;
//     //   const tokenResponse = await fetch(
//     //     `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`
//     //   );
//     //   const tokenData = await tokenResponse.json();
//     //   if (tokenData.error) {
//     //     return res.status(400).json({ message: tokenData.error.message });
//     //   }
//     //   const accessToken = tokenData.access_token;
//     //   const pagesResponse = await fetch(
//     //     `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
//     //   );
//     //   const pagesData = await pagesResponse.json();
//     //   if (pagesData.error || !pagesData.data.length) {
//     //     return res.status(400).json({ message: "No pages found or error" });
//     //   }
//     //   const page = pagesData.data[0];
//     //   accountData = {
//     //     platform: "Facebook",
//     //     username: page.name,
//     //     accessToken: page.access_token,
//     //   };
//     // }

//     }
//     else{
//       return res.status(400).json({ message: "Invalid callback parameters" });
//     }

//     // Update user's socialMediaAccounts
//     const updatedUser = await User.addSocialMediaAccount(
//       storedUserId,
//       { $push: { socialMediaAccounts: accountData } },
//       { new: true }
//     );
//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Clean up temporary oauth data
//     await User.updateOne({ _id: storedUserId }, { $unset: { twitter_oauth: "" } });

//     // Redirect to frontend success page
//     res.redirect("http://localhost:3000/social-media-success");
//   } catch (error) {
//     console.error("Callback error:", {
//       message: error.message,
//       stack: error.stack,
//     });
//     res.status(500).json({ message: `Error handling callback: ${error.message}` });
//   }
// };

// // Controller: Remove a social media account
// export const removeSocialMediaAccount = async (req, res) => {
// try {
//   // Extract userId, platform, and username from request body
//   const { userId, platform, username } = req.body;

//   // Validate input: ensure all required fields are provided
//   if (!userId || !platform || !username) {
//     return res
//       .status(400)
//       .json({ message: "User ID, platform, and username are required" });
//   }

//   // Remove the social media account using the User model's static method
//   const updatedUser = await User.removeSocialMediaAccount(
//     userId,
//     platform,
//     username
//   );
//   if (!updatedUser) {
//     return res.status(404).json({ message: "User or account not found" });
//   }

//   // Return updated user details
//   res.json({
//     id: updatedUser._id,
//     email: updatedUser.email,
//     name: updatedUser.name,
//     socialMediaAccounts: updatedUser.socialMediaAccounts,
//   });
// } catch (error) {
//   // Handle any errors (e.g., database errors)
//   res.status(500).json({ message: `Error removing account: ${error.message}` });
// }
// };

// // Controller: Get all users (admin only)
// export const getAllUsers = async (req, res) => {
// try {
//   // Fetch all users using the User model's static method
//   const users = await User.getAllUsers();

//   // Return array of users (exclude passwords for security)
//   res.json(
//     users.map((user) => ({
//       id: user._id,
//       email: user.email,
//       name: user.name,
//       socialMediaAccounts: user.socialMediaAccounts,
//       createdAt: user.createdAt,
//     }))
//   );
// } catch (error) {
//   // Handle any errors (e.g., database errors)
//   res.status(500).json({ message: `Error fetching users: ${error.message}` });
// }
// };

import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { exec } from "child_process";
import util from "util";
import path from "path";
import fs from "fs";

// Promisify exec for async/await
const execPromise = util.promisify(exec);

// Load environment variables
dotenv.config();

// Validate environment variables
if (
  !process.env.TWITTER_API_KEY ||
  !process.env.TWITTER_API_SECRET ||
  !process.env.TWITTER_CALLBACK_URL
) {
  console.error("Missing required Twitter environment variables");
  process.exit(1);
}

// Log environment variables for debugging
console.log("TWITTER_API_KEY:", process.env.TWITTER_API_KEY);
console.log("TWITTER_API_SECRET:", "[REDACTED]");
console.log("TWITTER_CALLBACK_URL:", process.env.TWITTER_CALLBACK_URL);

// Define paths
const PYTHON_DIR = path.join(process.cwd(), "..", "python", "venv", "Scripts");
const PYTHON_SCRIPT = path.join(PYTHON_DIR, "authorize_social_media.py");
const PYTHON_EXEC = path.join(PYTHON_DIR, "python.exe");

// Verify Python script exists
if (!fs.existsSync(PYTHON_SCRIPT)) {
  console.error(`Python script not found at: ${PYTHON_SCRIPT}`);
  process.exit(1);
}
if (!fs.existsSync(PYTHON_EXEC)) {
  console.error(`Python executable not found at: ${PYTHON_EXEC}`);
  process.exit(1);
}
console.log(`Python executable: ${PYTHON_EXEC}`);
console.log(`Python script: ${PYTHON_SCRIPT}`);

// Function to generate a valid PKCE code verifier
function generateCodeVerifier() {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const length = 64;
  let result = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  return result;
}

// Function to generate code challenge from code verifier
function generateCodeChallenge(codeVerifier) {
  return crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Controller: Register a new user
export const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    const userData = { email, password: hashedPassword, name };
    const user = await User.createUser(userData);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        socialMediaAccounts: user.socialMediaAccounts,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error registering user: ${error.message}` });
  }
};

// Controller: Login a user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        socialMediaAccounts: user.socialMediaAccounts,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error logging in user: ${error.message}` });
  }
};

// Controller: Get user details by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      socialMediaAccounts: user.socialMediaAccounts,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: `Error fetching user: ${error.message}` });
  }
};

// Controller: Update user details
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;
    if (!email && !name) {
      return res.status(400).json({ message: "No fields provided for update" });
    }
    const updateData = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    const updatedUser = await User.updateUser(id, updateData);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      socialMediaAccounts: updatedUser.socialMediaAccounts,
    });
  } catch (error) {
    res.status(500).json({ message: `Error updating user: ${error.message}` });
  }
};

// Controller: Add a social media account
export const addSocialMediaAccount = async (req, res) => {
  try {
    const { userId, platform } = req.body;
    if (!userId || !platform) {
      return res
        .status(400)
        .json({ message: "User ID and platform are required" });
    }
    const validPlatforms = ["Twitter", "Instagram", "Facebook"];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ message: "Invalid platform" });
    }

    if (platform === "Twitter") {
      // Generate state
      const state = crypto.randomBytes(16).toString("hex");

      // Execute Python script to initiate OAuth
      const command = `"${PYTHON_EXEC}" "${PYTHON_SCRIPT}" Twitter ${userId}`;
      console.log(`Executing command: ${command}`);
      const { stdout, stderr } = await execPromise(command, {
        cwd: PYTHON_DIR,
      });

      if (stderr) {
        console.error(`Python script error: ${stderr}`);
        return res
          .status(500)
          .json({ message: `Error initiating Twitter OAuth: ${stderr}` });
      }

      // Extract OAuth URL from Python script output
      const urlMatch = stdout.match(/Twitter OAuth URL: (https:\/\/[^\s]+)/);
      if (!urlMatch) {
        console.error(`Failed to extract OAuth URL from: ${stdout}`);
        return res.status(500).json({
          message: `Failed to initiate Twitter OAuth: Invalid script output\n${stdout}`,
        });
      }

      const oauthUrl = urlMatch[1];
      console.log(`OAuth URL: ${oauthUrl}`);
      res.json({ oauthUrl });
    } else {
      // Handle Instagram and Facebook (unchanged)
      const state = crypto.randomBytes(16).toString("hex");
      let oauthUrl;
      if (platform === "Instagram") {
        const appId = process.env.INSTAGRAM_APP_ID;
        const redirectUri = process.env.INSTAGRAM_CALLBACK_URL;
        oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${state}&scope=instagram_basic,instagram_manage_insights`;
      } else if (platform === "Facebook") {
        const appId = process.env.FACEBOOK_APP_ID;
        const redirectUri = process.env.FACEBOOK_CALLBACK_URL;
        oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${state}&scope=pages_show_list,pages_read_engagement`;
      }
      res.json({ oauthUrl });
    }
  } catch (error) {
    console.error("Add Social Media Account Error:", error);
    res
      .status(500)
      .json({ message: `Error initiating OAuth: ${error.message}` });
  }
};

// Controller: Handle social media callback
export const handleSocialCallback = async (req, res) => {
  try {
    const { state, code, error, error_description } = req.query;
    console.log("Callback - Raw req.query:", req.query);

    if (error) {
      return res
        .status(400)
        .json({ message: `OAuth error: ${error_description || error}` });
    }

    if (!state || !code) {
      return res
        .status(400)
        .json({ message: "Missing state or code parameter" });
    }

    // Find user by state
    const user = await User.findOne({ "twitter_oauth.state": state });
    console.log(
      "Found user twitter_oauth:",
      user ? user.twitter_oauth : "null"
    );
    if (!user || !user.twitter_oauth) {
      return res
        .status(400)
        .json({ message: "Invalid state or user not found" });
    }

    const storedUserId = String(user.twitter_oauth.userId);
    console.log("Callback userId:", storedUserId, "Type:", typeof storedUserId);

    if (
      user.twitter_oauth.platform === "Twitter" ||
      !user.twitter_oauth.platform
    ) {
      // Execute Python script to handle callback
      const command = `"${PYTHON_EXEC}" "${PYTHON_SCRIPT}" Twitter ${storedUserId} ${state} ${code}`;
      console.log(`Executing command: ${command}`);
      const { stdout, stderr } = await execPromise(command, {
        cwd: PYTHON_DIR,
      });

      if (stderr) {
        console.error(`Python script error: ${stderr}`);
        return res
          .status(500)
          .json({ message: `Error handling Twitter callback: ${stderr}` });
      }

      // Check if Python script succeeded
      if (!stdout.includes("Twitter authorization completed")) {
        console.error(`Python script failed: ${stdout}`);
        return res
          .status(500)
          .json({ message: `Twitter authorization failed: ${stdout}` });
      }

      // Fetch updated user
      const updatedUser = await User.findById(storedUserId);
      if (!updatedUser || !updatedUser.socialMediaAccounts.length) {
        return res.status(500).json({ message: "Failed to add social media account" });
      }

      const account = updatedUser.socialMediaAccounts[0];
      const query = new URLSearchParams({
        platform: account.platform,
        username: account.username,
        accessToken: account.accessToken,
        refreshToken: account.refreshToken || "",
      });

      // Clean up OAuth data
      await User.updateOne({ _id: storedUserId }, { $unset: { twitter_oauth: "" } });
      // Redirect to frontend success page
      res.redirect(
        `http://localhost:5173/social-media-success?${query.toString()}`
      );
    } else {
      // Handle Instagram and Facebook (unchanged)
      let accountData;
      if (user.twitter_oauth.platform === "Instagram" && code) {
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
      } else if (user.twitter_oauth.platform === "Facebook" && code) {
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
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
        );
        const pagesData = await pagesResponse.json();
        if (pagesData.error || !pagesData.data.length) {
          return res.status(400).json({ message: "No pages found or error" });
        }
        const page = pagesData.data[0];
        accountData = {
          platform: "Facebook",
          username: page.name,
          accessToken: page.access_token,
        };
      } else {
        return res.status(400).json({ message: "Invalid callback parameters" });
      }

      // Update user's socialMediaAccounts
      const updatedUser = await User.addSocialMediaAccount(storedUserId, accountData);
      if (!updatedUser) 
      {
        return res.status(404).json({ message: "User not found" });
      }

      // Clean up temporary oauth data
      await User.updateOne(
        { _id: storedUserId },
        { $unset: { twitter_oauth: "" } }
      );

      await User.updateOne({ _id: storedUserId }, { $unset: { twitter_oauth: "" } })
      // Redirect to frontend success page
      res.redirect("http://localhost:3000/social-media-success");
    }
  } catch (error) {
    console.error("Callback error:", {
      message: error.message,
      stack: error.stack,
    });
    res
      .status(500)
      .json({ message: `Error handling callback: ${error.message}` });
  }
};

// Controller: Remove a social media account
export const removeSocialMediaAccount = async (req, res) => {
  try {
    const { userId, platform, username } = req.body;
    if (!userId || !platform || !username) {
      return res
        .status(400)
        .json({ message: "User ID, platform, and username are required" });
    }
    const updatedUser = await User.removeSocialMediaAccount(
      userId,
      platform,
      username
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User or account not found" });
    }
    res.json({
      id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      socialMediaAccounts: updatedUser.socialMediaAccounts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error removing account: ${error.message}` });
  }
};

// Controller: Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
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
    res.status(500).json({ message: `Error fetching users: ${error.message}` });
  }
};

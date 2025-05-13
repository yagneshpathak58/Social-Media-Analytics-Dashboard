// import Post from "../models/postModel.js";
// import User from "../models/userModel.js";
// import { exec } from "child_process";
// import util from "util";
// import fs from "fs/promises"; // Correct import for promise-based fs
// import path from "path";
// import { fileURLToPath } from "url";
// import dotenv from "dotenv";
// import { spawn } from "child_process";
// import fetch from "node-fetch";
// import crypto from "crypto"; // Add crypto for state generation

// // Promisify exec for async/await
// const execPromise = util.promisify(exec);

// // Load environment variables
// dotenv.config();

// // Helper function to get __dirname in ES modules
// const getDirName = (metaUrl) => {
//   const __filename = fileURLToPath(metaUrl);
//   return path.dirname(__filename);
// };

// // Controller: Create a new post
// export const createPost = async (req, res) => {
//   try {
//     const { platform, postId, userId, content, postedAt, likes, comments, shares, hashtags, sentiment } = req.body;
//     if (!platform || !postId || !userId || !content || !postedAt) {
//       return res.status(400).json({ message: "Platform, postId, userId, content, and postedAt are required" });
//     }
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     const postData = {
//       platform,
//       postId,
//       userId,
//       content,
//       postedAt: new Date(postedAt),
//       likes: likes || 0,
//       comments: comments || 0,
//       shares: shares || 0,
//       hashtags: hashtags || [],
//       sentiment,
//     };
//     const post = await Post.createPost(postData);
//     res.status(201).json(post);
//   } catch (error) {
//     console.error('Error creating post:', error);
//     res.status(500).json({ message: `Error creating post: ${error.message}` });
//   }
// };

// // Controller: Initiate Twitter OAuth for post fetching
// export const initiateTwitterPost = async (req, res) => {
//   try {
//     const { userId } = req.query;
//     if (!userId) {
//       return res.status(400).json({ message: 'User ID is required' });
//     }

//     // Validate user exists
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Check if user has a valid Twitter accessToken
//     const twitterAccount = user.socialMediaAccounts.find(acc => acc.platform === "Twitter");
//     if (twitterAccount && twitterAccount.accessToken) {
//       // Skip OAuth and fetch posts directly
//       const posts = await fetchPostsWithAccessToken(userId, twitterAccount.accessToken);
//       if (posts) {
//         // Store posts temporarily in twitter_post_oauth
//         const state = crypto.randomBytes(16).toString("hex");
//         await User.updateOne(
//           { _id: userId },
//           {
//             $set: {
//               twitter_post_oauth: {
//                 state,
//                 userId,
//                 codeVerifier: "",
//                 posts,
//               },
//             },
//           }
//         );
//         const redirectUrl = `${process.env.FRONTEND_URL}/select-post?userId=${userId}&state=${state}`;
//         return res.status(200).json({ redirectUrl });
//       }
//     }

//     // If no valid accessToken, proceed with OAuth
//     const __dirname = getDirName(import.meta.url);
//     const pythonScriptPath = path.join(__dirname, '../../python/venv/Scripts/fetch_social_media_data.py');
//     const pythonExecutable = path.join(__dirname, '../../python/venv/Scripts/python.exe');

//     console.log('Executing command:', `"${pythonExecutable}" "${pythonScriptPath}" Twitter "${userId}"`);

//     const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, 'Twitter', userId]);

//     let stdoutData = '';
//     let stderrData = '';

//     pythonProcess.stdout.on('data', (data) => {
//       stdoutData += data.toString();
//     });

//     pythonProcess.stderr.on('data', (data) => {
//       stderrData += data.toString();
//     });

//     pythonProcess.on('close', (code) => {
//       if (code === 0 && stdoutData.trim()) {
//         const oauthUrlMatch = stdoutData.match(/https:\/\/twitter\.com\/i\/oauth2\/authorize\?.*$/m);
//         const oauthUrl = oauthUrlMatch ? oauthUrlMatch[0] : null;
//         if (oauthUrl) {
//           console.log('OAuth URL:', oauthUrl);
//           return res.status(200).json({ oauthUrl });
//         } else {
//           console.error('No valid OAuth URL found in stdout:', stdoutData);
//           return res.status(500).json({ message: 'Failed to parse OAuth URL', details: stdoutData });
//         }
//       } else {
//         console.error('Python script error:', stderrData);
//         return res.status(500).json({ message: 'Failed to initiate Twitter post fetch', details: stderrData });
//       }
//     });
//   } catch (error) {
//     console.error('Error initiating Twitter post fetch:', error);
//     return res.status(500).json({ message: 'Server error', details: error.message });
//   }
// };

// // Helper function to fetch posts using accessToken
// async function fetchPostsWithAccessToken(userId, accessToken) {
//   try {
//     // Fetch user info to get Twitter user ID
//     const userInfoResponse = await fetch("https://api.twitter.com/2/users/me?user.fields=id,username", {
//       headers: { Authorization: `Bearer ${accessToken}` },
//     });
//     const userData = await userInfoResponse.json();
//     if (userInfoResponse.status !== 200) {
//       console.error("Failed to fetch user info:", userData);
//       return null;
//     }

//     const twitterUserId = userData.data.id;

//     // Fetch recent tweets
//     const tweetsResponse = await fetch(
//       `https://api.twitter.com/2/users/${twitterUserId}/tweets?tweet.fields=id,text,created_at,public_metrics,entities&max_results=10`,
//       { headers: { Authorization: `Bearer ${accessToken}` } }
//     );
//     const tweetsData = await tweetsResponse.json();
//     if (tweetsResponse.status !== 200) {
//       console.error("Failed to fetch tweets:", tweetsData);
//       return null;
//     }

//     const posts = tweetsData.data.map((tweet) => ({
//       platform: "Twitter",
//       postId: tweet.id,
//       userId,
//       content: tweet.text,
//       postedAt: new Date(tweet.created_at),
//       likes: tweet.public_metrics.like_count,
//       comments: tweet.public_metrics.reply_count,
//       shares: tweet.public_metrics.retweet_count,
//       hashtags: tweet.entities?.hashtags?.map((tag) => tag.tag) || [],
//       sentiment: null,
//     }));

//     return posts;
//   } catch (error) {
//     console.error("Error fetching posts with accessToken:", error);
//     return null;
//   }
// }

// // Controller: Handle Twitter post callback
// export const twitterPostCallback = async (req, res) => {
//   try {
//     console.log('Post Callback - Raw req.query:', req.query);
//     const { state, code, error } = req.query;

//     const fullCallbackUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
//     console.log('Full Callback URL:', fullCallbackUrl);

//     if (error) {
//       console.error('OAuth error received:', error);
//       return res.status(400).json({ message: 'OAuth error', details: error });
//     }

//     if (!state || !code) {
//       return res.status(400).json({ message: 'Missing state or code in callback' });
//     }

//     const user = await User.findOne({ 'twitter_post_oauth.state': state });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found or invalid state' });
//     }

//     console.log('Found user twitter_post_oauth:', user.twitter_post_oauth);

//     const userId = user.twitter_post_oauth.userId;
//     const __dirname = getDirName(import.meta.url);
//     const tempDir = path.join(__dirname, '../temp');
//     await fs.mkdir(tempDir, { recursive: true });

//     const tempFilePath = path.join(tempDir, `oauth_code_${state}.txt`);
//     await fs.writeFile(tempFilePath, code);
//     console.log('Wrote OAuth code to temp file:', tempFilePath);

//     const pythonScriptPath = path.join(__dirname, '../../python/venv/Scripts/fetch_social_media_data.py');
//     const pythonExecutable = path.join(__dirname, '../../python/venv/Scripts/python.exe');

//     console.log('Executing command:', `"${pythonExecutable}" "${pythonScriptPath}" Twitter "${userId}" "${state}" "${tempFilePath}"`);

//     const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, 'Twitter', userId, state, tempFilePath]);

//     let stdoutData = '';
//     let stderrData = '';

//     pythonProcess.stdout.on('data', (data) => {
//       stdoutData += data.toString();
//     });

//     pythonProcess.stderr.on('data', (data) => {
//       stderrData += data.toString();
//     });

//     pythonProcess.on('close', async (code) => {
//       try {
//         await fs.unlink(tempFilePath);
//         console.log('Deleted temp file:', tempFilePath);
//       } catch (err) {
//         console.error('Error deleting temp file:', err);
//       }

//       if (code === 0 && stdoutData.trim()) {
//         const redirectUrl = stdoutData.trim();
//         console.log('Redirect URL:', redirectUrl);
//         if (redirectUrl.startsWith('http://localhost:3000/select-post')) {
//           return res.redirect(redirectUrl);
//         } else {
//           console.error('Invalid redirect URL:', redirectUrl);
//           return res.status(500).json({ message: 'Invalid redirect URL from Python script', details: redirectUrl });
//         }
//       } else {
//         console.error('Python script error:', stderrData);
//         return res.status(500).json({ message: 'Python script error', details: stderrData });
//       }
//     });
//   } catch (error) {
//     console.error('Error handling Twitter post callback:', error);
//     return res.status(500).json({ message: 'Server error', details: error.message });
//   }
// };

// // Controller: Fetch posts dynamically from Twitter
// export const fetchTwitterPosts = async (req, res) => {
//   try {
//     const { userId, state } = req.query;
//     if (!userId || !state) {
//       return res.status(400).json({ message: "User ID and state are required" });
//     }
//     const user = await User.findById(userId);
//     if (!user || !user.twitter_post_oauth || user.twitter_post_oauth.state !== state) {
//       return res.status(400).json({ message: "Invalid user or state" });
//     }
//     res.json(user.twitter_post_oauth.posts || []);
//   } catch (error) {
//     console.error("Error fetching Twitter posts:", error);
//     res.status(500).json({ message: `Error fetching Twitter posts: ${error.message}` });
//   }
// };

// // Controller: Select and store posts
// export const selectPosts = async (req, res) => {
//   try {
//     const { userId, state, postIds } = req.body;
//     if (!userId || !state || !postIds || !Array.isArray(postIds)) {
//       return res.status(400).json({ message: "User ID, state, and postIds (array) are required" });
//     }

//     const user = await User.findById(userId);
//     if (!user || !user.twitter_post_oauth || user.twitter_post_oauth.state !== state) {
//       return res.status(400).json({ message: "Invalid user or state" });
//     }

//     const selectedPosts = user.twitter_post_oauth.posts.filter((post) => postIds.includes(post.postId));
//     if (!selectedPosts.length) {
//       return res.status(400).json({ message: "No valid posts selected" });
//     }

//     // Store selected posts in posts_collection
//     for (const post of selectedPosts) {
//       await Post.createPost({
//         platform: post.platform,
//         postId: post.postId,
//         userId: post.userId,
//         content: post.content,
//         postedAt: new Date(post.postedAt),
//         likes: post.likes,
//         comments: post.comments,
//         shares: post.shares,
//         hashtags: post.hashtags,
//         sentiment: post.sentiment,
//       });
//     }

//     // Run the calculate_analytics.py script
//     const __dirname = getDirName(import.meta.url);
//     const pythonScriptPath = path.join(__dirname, '../python/Scripts/calculate_analytics.py');
//     const pythonExecutable = path.join(__dirname, '../python/venv/Scripts/python.exe');

//     console.log('Executing analytics script:', `"${pythonExecutable}" "${pythonScriptPath}"`);

//     const pythonProcess = spawn(pythonExecutable, [pythonScriptPath]);

//     let stdoutData = '';
//     let stderrData = '';

//     pythonProcess.stdout.on('data', (data) => {
//       stdoutData += data.toString();
//     });

//     pythonProcess.stderr.on('data', (data) => {
//       stderrData += data.toString();
//     });

//     pythonProcess.on('close', async (code) => {
//       if (code !== 0) {
//         console.error('Analytics script error:', stderrData);
//         // Log the error but don't fail the API response
//       } else {
//         console.log('Analytics script output:', stdoutData);
//       }

//       // Clear temporary posts
//       await User.updateOne(
//         { _id: userId },
//         { $unset: { twitter_post_oauth: "" } }
//       );

//       // Return success response
//       res.status(200).json({ message: "Posts stored and analytics calculated successfully", posts: selectedPosts });
//     });
//   } catch (error) {
//     console.error("Error selecting posts:", error);
//     res.status(500).json({ message: `Error selecting posts: ${error.message}` });
//   }
// };


import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { exec } from "child_process";
import util from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { spawn } from "child_process";
import fetch from "node-fetch";
import crypto from "crypto";

// Promisify exec for async/await
const execPromise = util.promisify(exec);

// Load environment variables
dotenv.config();

// Helper function to get __dirname in ES modules
const getDirName = (metaUrl) => {
  const __filename = fileURLToPath(metaUrl);
  return path.dirname(__filename);
};

// Controller: Create a new post
export const createPost = async (req, res) => {
  try {
    const { platform, postId, userId, content, postedAt, likes, comments, shares, hashtags, sentiment } = req.body;
    if (!platform || !postId || !userId || !content || !postedAt) {
      return res.status(400).json({ message: "Platform, postId, userId, content, and postedAt are required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const postData = {
      platform,
      postId,
      userId,
      content,
      postedAt: new Date(postedAt),
      likes: likes || 0,
      comments: comments || 0,
      shares: shares || 0,
      hashtags: hashtags || [],
      sentiment,
    };
    const post = await Post.createPost(postData);
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: `Error creating post: ${error.message}` });
  }
};

// Controller: Initiate Twitter OAuth for post fetching
export const initiateTwitterPost = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a valid Twitter accessToken
    const twitterAccount = user.socialMediaAccounts.find(acc => acc.platform === "Twitter");
    if (twitterAccount && twitterAccount.accessToken) {
      // Skip OAuth and fetch posts directly
      const posts = await fetchPostsWithAccessToken(userId, twitterAccount.accessToken);
      if (posts) {
        // Store posts temporarily in twitter_post_oauth
        const state = crypto.randomBytes(16).toString("hex");
        await User.updateOne(
          { _id: userId },
          {
            $set: {
              twitter_post_oauth: {
                state,
                userId,
                codeVerifier: "",
                posts,
              },
            },
          }
        );
        const redirectUrl = `${process.env.FRONTEND_URL}/select-post?userId=${userId}&state=${state}`;
        return res.status(200).json({ redirectUrl });
      }
    }

    // If no valid accessToken, proceed with OAuth
    const __dirname = getDirName(import.meta.url);
    const pythonScriptPath = path.join(__dirname, '../../python/venv/Scripts/fetch_social_media_data.py');
    const pythonExecutable = path.join(__dirname, '../../python/venv/Scripts/python.exe');

    console.log('Executing command:', `"${pythonExecutable}" "${pythonScriptPath}" Twitter "${userId}"`);

    const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, 'Twitter', userId]);

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0 && stdoutData.trim()) {
        const oauthUrlMatch = stdoutData.match(/https:\/\/twitter\.com\/i\/oauth2\/authorize\?.*$/m);
        const oauthUrl = oauthUrlMatch ? oauthUrlMatch[0] : null;
        if (oauthUrl) {
          console.log('OAuth URL:', oauthUrl);
          return res.status(200).json({ oauthUrl });
        } else {
          console.error('No valid OAuth URL found in stdout:', stdoutData);
          return res.status(500).json({ message: 'Failed to parse OAuth URL', details: stdoutData });
        }
      } else {
        console.error('Python script error:', stderrData);
        return res.status(500).json({ message: 'Failed to initiate Twitter post fetch', details: stderrData });
      }
    });
  } catch (error) {
    console.error('Error initiating Twitter post fetch:', error);
    return res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Helper function to fetch posts using accessToken
async function fetchPostsWithAccessToken(userId, accessToken) {
  try {
    // Fetch user info to get Twitter user ID
    const userInfoResponse = await fetch("https://api.twitter.com/2/users/me?user.fields=id,username", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userInfoResponse.json();
    if (userInfoResponse.status !== 200) {
      console.error("Failed to fetch user info:", userData);
      return null;
    }

    const twitterUserId = userData.data.id;

    // Fetch recent tweets
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${twitterUserId}/tweets?tweet.fields=id,text,created_at,public_metrics,entities&max_results=10`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const tweetsData = await tweetsResponse.json();
    if (tweetsResponse.status !== 200) {
      console.error("Failed to fetch tweets:", tweetsData);
      return null;
    }

    const posts = tweetsData.data.map((tweet) => ({
      platform: "Twitter",
      postId: tweet.id,
      userId,
      content: tweet.text,
      postedAt: new Date(tweet.created_at),
      likes: tweet.public_metrics.like_count,
      comments: tweet.public_metrics.reply_count,
      shares: tweet.public_metrics.retweet_count,
      hashtags: tweet.entities?.hashtags?.map((tag) => tag.tag) || [],
      sentiment: null,
    }));

    return posts;
  } catch (error) {
    console.error("Error fetching posts with accessToken:", error);
    return null;
  }
}

// Controller: Handle Twitter post callback
export const twitterPostCallback = async (req, res) => {
  try {
    console.log('Post Callback - Raw req.query:', req.query);
    const { state, code, error } = req.query;

    const fullCallbackUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    console.log('Full Callback URL:', fullCallbackUrl);

    if (error) {
      console.error('OAuth error received:', error);
      return res.status(400).json({ message: 'OAuth error', details: error });
    }

    if (!state || !code) {
      return res.status(400).json({ message: 'Missing state or code in callback' });
    }

    const user = await User.findOne({ 'twitter_post_oauth.state': state });
    if (!user) {
      return res.status(404).json({ message: 'User not found or invalid state' });
    }

    console.log('Found user twitter_post_oauth:', user.twitter_post_oauth);

    const userId = user.twitter_post_oauth.userId;
    const __dirname = getDirName(import.meta.url);
    const tempDir = path.join(__dirname, '../temp');
    await fs.mkdir(tempDir, { recursive: true });

    const tempFilePath = path.join(tempDir, `oauth_code_${state}.txt`);
    await fs.writeFile(tempFilePath, code);
    console.log('Wrote OAuth code to temp file:', tempFilePath);

    const pythonScriptPath = path.join(__dirname, '../../python/venv/Scripts/fetch_social_media_data.py');
    const pythonExecutable = path.join(__dirname, '../../python/venv/Scripts/python.exe');

    console.log('Executing command:', `"${pythonExecutable}" "${pythonScriptPath}" Twitter "${userId}" "${state}" "${tempFilePath}"`);

    const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, 'Twitter', userId, state, tempFilePath]);

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      try {
        await fs.unlink(tempFilePath);
        console.log('Deleted temp file:', tempFilePath);
      } catch (err) {
        console.error('Error deleting temp file:', err);
      }

      if (code === 0 && stdoutData.trim()) {
        const redirectUrl = stdoutData.trim();
        console.log('Redirect URL:', redirectUrl);
        const userData = await User.findById(userId);
        console.log("userData",userData)
        if (redirectUrl.startsWith('http://localhost:3000/select-post')) {
          return res.redirect(redirectUrl);
        } else {
          console.error('Invalid redirect URL:', redirectUrl);
          return res.status(500).json({ message: 'Invalid redirect URL from Python script', details: redirectUrl });
        }
      } else {
        console.error('Python script error:', stderrData);
        return res.status(500).json({ message: 'Python script error', details: stderrData });
      }
    });
  } catch (error) {
    console.error('Error handling Twitter post callback:', error);
    return res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Controller: Fetch posts dynamically from Twitter
export const fetchTwitterPosts = async (req, res) => {
  try {
    const { userId, state } = req.query;
    if (!userId || !state) {
      return res.status(400).json({ message: "User ID and state are required" });
    }
    const user = await User.findById(userId);
    if (!user || !user.twitter_post_oauth || user.twitter_post_oauth.state !== state) {
      return res.status(400).json({ message: "Invalid user or state" });
    }
    res.json(user.twitter_post_oauth.posts || []);
  } catch (error) {
    console.error("Error fetching Twitter posts:", error);
    res.status(500).json({ message: `Error fetching Twitter posts: ${error.message}` });
  }
};

// Controller: Select and store posts
export const selectPosts = async (req, res) => {
  try {
    const { userId, state, postIds } = req.body;
    if (!userId || !state || !postIds || !Array.isArray(postIds)) {
      return res.status(400).json({ message: "User ID, state, and postIds (array) are required" });
    }

    const user = await User.findById(userId);
    if (!user || !user.twitter_post_oauth || user.twitter_post_oauth.state !== state) {
      return res.status(400).json({ message: "Invalid user or state" });
    }

    const selectedPosts = user.twitter_post_oauth.posts.filter((post) => postIds.includes(post.postId));
    if (!selectedPosts.length) {
      return res.status(400).json({ message: "No valid posts selected" });
    }

    // Store selected posts in posts_collection
    const storedPosts = [];
    for (const post of selectedPosts) {
      const storedPost = await Post.createPost({
        platform: post.platform,
        postId: post.postId,
        userId: post.userId,
        content: post.content,
        postedAt: new Date(post.postedAt),
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        hashtags: post.hashtags,
        sentiment: post.sentiment,
      });
      storedPosts.push(storedPost);
    }

    // Trigger analytics calculation for selected posts
    const __dirname = getDirName(import.meta.url);
    const pythonScriptPath = path.join(__dirname, '../../python/venv/Scripts/calculate_analytics.py');
    const pythonExecutable = path.join(__dirname, '../../python/venv/Scripts/python.exe');

    // Pass post IDs as a comma-separated string
    const postMongoIds = storedPosts.map(post => post._id.toString()).join(",");
    console.log('Executing analytics command:', `"${pythonExecutable}" "${pythonScriptPath}" "${postMongoIds}"`);

    const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, postMongoIds]);

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    const analyticsPromise = new Promise((resolve, reject) => {
      pythonProcess.on('close', async (code) => {
        if (code === 0) {
          console.log('Analytics script output:', stdoutData);
          try {
            // Parse output for graph file paths (assuming script outputs JSON)
            const output = JSON.parse(stdoutData);
            resolve(output);
          } catch (err) {
            console.error('Error parsing analytics output:', err);
            reject(new Error('Failed to parse analytics output'));
          }
        } else {
          console.error('Analytics script error:', stderrData);
          reject(new Error(`Analytics script failed: ${stderrData}`));
        }
      });
    });

    // Wait for analytics to complete
    const analyticsOutput = await analyticsPromise;

    // Clear temporary posts
    await User.updateOne(
      { _id: userId },
      { $unset: { twitter_post_oauth: "" } }
    );

    // Fetch analytics records for the stored posts
    const analyticsRecords = await Promise.all(
      storedPosts.map(async (post) => {
        const analytics = await Analytics.findOne({ postId: post._id });
        return analytics;
      })
    );

    res.status(200).json({
      message: "Posts stored and analyzed successfully",
      posts: storedPosts,
      analytics: analyticsRecords.filter(record => record),
      graphs: analyticsOutput.graphs || [], // Graph file paths from Python script
    });
  } catch (error) {
    console.error("Error selecting posts:", error);
    res.status(500).json({ message: `Error selecting posts: ${error.message}` });
  }
};


// Controller: Get posts by userId
export const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.findByUserId(userId);
    if (!posts.length) {
      return res.status(404).json({ message: "No posts found for this user" });
    }
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: `Error fetching posts: ${error.message}` });
  }
};

// Controller: Get post by platform and postId
export const getPostById = async (req, res) => {
  try {
    const { platform, postId } = req.params;
    const post = await Post.findByPlatformAndPostId(platform, postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: `Error fetching post: ${error.message}` });
  }
};

// Controller: Update a post
export const updatePost = async (req, res) => {
  try {
    const { platform, postId, content, likes, comments, shares, hashtags, sentiment } = req.body;
    const updateData = {};
    if (content) updateData.content = content;
    if (likes !== undefined) updateData.likes = likes;
    if (comments !== undefined) updateData.comments = comments;
    if (shares !== undefined) updateData.shares = shares;
    if (hashtags) updateData.hashtags = hashtags;
    if (sentiment) updateData.sentiment = sentiment;
    const updatedPost = await Post.updatePost(postId, platform, updateData);
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: `Error updating post: ${error.message}` });
  }
};

// Controller: Delete a post
export const deletePost = async (req, res) => {
  try {
    const { platform, postId } = req.params;
    const deletedPost = await Post.deletePost(postId, platform);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: `Error deleting post: ${error.message}` });
  }
};

// Controller: Get posts by hashtag
export const getPostsByHashtag = async (req, res) => {
  try {
    const { hashtag } = req.params;
    const posts = await Post.findByHashtag(hashtag);
    if (!posts.length) {
      return res.status(404).json({ message: "No posts found with this hashtag" });
    }
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts by hashtag:', error);
    res.status(500).json({ message: `Error fetching posts: ${error.message}` });
  }
};
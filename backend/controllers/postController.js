// import Post from "../models/postModel.js";
// import User from "../models/userModel.js";
// import { exec } from "child_process";
// import util from "util";
// import fs from "fs/promises";
// import path from "path";
// import dotenv from "dotenv";
// import { spawn } from "child_process";

// // Promisify exec for async/await
// const execPromise = util.promisify(exec);

// // Load environment variables
// dotenv.config();

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
//         const oauthUrl = stdoutData.trim();
//         console.log('OAuth URL:', oauthUrl);
//         return res.status(200).json({ oauthUrl });
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

//       // Check stdout for redirect URL, ignore non-critical stderr (e.g., logging errors)
//       if (code === 0 && stdoutData.trim()) {
//         const redirectUrl = stdoutData.trim();
//         console.log('Redirect URL:', redirectUrl);
//         // Validate redirect URL
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

// // Controller: Get posts by userId
// export const getPostsByUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const posts = await Post.findByUserId(userId);
//     if (!posts.length) {
//       return res.status(404).json({ message: "No posts found for this user" });
//     }
//     res.json(posts);
//   } catch (error) {
//     console.error('Error fetching posts:', error);
//     res.status(500).json({ message: `Error fetching posts: ${error.message}` });
//   }
// };

// // Controller: Get post by platform and postId
// export const getPostById = async (req, res) => {
//   try {
//     const { platform, postId } = req.params;
//     const post = await Post.findByPlatformAndPostId(platform, postId);
//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }
//     res.json(post);
//   } catch (error) {
//     console.error('Error fetching post:', error);
//     res.status(500).json({ message: `Error fetching post: ${error.message}` });
//   }
// };

// // Controller: Update a post
// export const updatePost = async (req, res) => {
//   try {
//     const { platform, postId, content, likes, comments, shares, hashtags, sentiment } = req.body;
//     const updateData = {};
//     if (content) updateData.content = content;
//     if (likes !== undefined) updateData.likes = likes;
//     if (comments !== undefined) updateData.comments = comments;
//     if (shares !== undefined) updateData.shares = shares;
//     if (hashtags) updateData.hashtags = hashtags;
//     if (sentiment) updateData.sentiment = sentiment;
//     const updatedPost = await Post.updatePost(postId, platform, updateData);
//     if (!updatedPost) {
//       return res.status(404).json({ message: "Post not found" });
//     }
//     res.json(updatedPost);
//   } catch (error) {
//     console.error('Error updating post:', error);
//     res.status(500).json({ message: `Error updating post: ${error.message}` });
//   }
// };

// // Controller: Delete a post
// export const deletePost = async (req, res) => {
//   try {
//     const { platform, postId } = req.params;
//     const deletedPost = await Post.deletePost(postId, platform);
//     if (!deletedPost) {
//       return res.status(404).json({ message: "Post not found" });
//     }
//     res.json({ message: "Post deleted successfully" });
//   } catch (error) {
//     console.error('Error deleting post:', error);
//     res.status(500).json({ message: `Error deleting post: ${error.message}` });
//   }
// };

// // Controller: Get posts by hashtag
// export const getPostsByHashtag = async (req, res) => {
//   try {
//     const { hashtag } = req.params;
//     const posts = await Post.findByHashtag(hashtag);
//     if (!posts.length) {
//       return res.status(404).json({ message: "No posts found with this hashtag" });
//     }
//     res.json(posts);
//   } catch (error) {
//     console.error('Error fetching posts by hashtag:', error);
//     res.status(500).json({ message: `Error fetching posts: ${error.message}` });
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
        // Extract the OAuth URL (last line starting with https://twitter.com)
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

      // Check stdout for redirect URL, ignore non-critical stderr (e.g., logging errors)
      if (code === 0 && stdoutData.trim()) {
        const redirectUrl = stdoutData.trim();
        console.log('Redirect URL:', redirectUrl);
        // Validate redirect URL
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
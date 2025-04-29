import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


// Load environment variables from .env file
dotenv.config();

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
      // Extract userId, platform, username, and accessToken from request body
      const { userId, platform, username, accessToken } = req.body;
  
      // Validate input: ensure all required fields are provided
      if (!userId || !platform || !username) {
        return res
          .status(400)
          .json({ message: "User ID, platform, and username are required" });
      }
  
      // Prepare social media account data
      const accountData = { platform, username };
      if (accessToken) accountData.accessToken = accessToken;
  
      // Add the social media account using the User model's static method
      const updatedUser = await User.addSocialMediaAccount(userId, accountData);
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
      // Handle any errors (e.g., duplicate account, validation errors)
      res.status(500).json({ message: `Error adding account: ${error.message}` });
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
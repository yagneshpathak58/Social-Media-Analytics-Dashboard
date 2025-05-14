import mongoose from "mongoose";

// Define the user schema using mongoose.Schema
const userSchema = new mongoose.Schema({
    // Email field: required, unique, and validated as an email format
    email: {
      type: String,
      required: [true, "Email is required"], // Error message if missing
      unique: true, // Ensures no duplicate emails in the collection
      trim: true, // Removes whitespace
      lowercase: true, // Converts email to lowercase
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"], // Regex for email validation
    },
    // Password field: required (will be hashed before saving, handled in routes)
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"], // Minimum length validation
      match:[/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,"Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"],
      // 
      // match:[/^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,"Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"],
    },
    // Name field: optional, for user’s full name
    name: {
      type: String,
      trim: true, // Removes whitespace
    },
    // SocialMediaAccounts field: array of social media account objects
    socialMediaAccounts: [
      {
        // Platform field: required, e.g., "Twitter", "Instagram"
        platform: {
          type: String,
          required: [true, "Platform is required"],
          enum: ["Twitter", "Instagram", "Facebook"], // Restrict to specific platforms
        },
        // Username field: required, unique per platform
        username: {
          type: String,
          required: [true, "Username is required"],
          trim: true,
        },
        // AccessToken field: optional, for API authentication
        accessToken: {
          type: String,
          trim: true,
        },
        refreshToken: {
          type: String,
          trim: true,
        },
      },
    ],
    // Twitter OAuth temporary storage
    twitter_oauth: {
      state: {
        type: String,
        trim: true,
      },
      userId: {
        type: String,
        trim: true,
      },
      codeVerifier: {
        type: String,
        trim: true,
      },
      platform: {
        type: String,
        trim: true,
        enum: ["Twitter", "Instagram", "Facebook"],
      },
    },
    twitter_post_oauth: {
      state: {
        type: String,
        trim: true,
      },
      userId: {
        type: String,
        trim: true,
      },
      codeVerifier: {
        type: String,
        trim: true,
      },
      posts: [
        {
          platform: { type: String },
          postId: { type: String },
          userId: { type: String },
          content: { type: String },
          postedAt: { type: String },
          likes: { type: Number },
          comments: { type: Number },
          shares: { type: Number },
          hashtags: [{ type: String }],
          sentiment: { type: String },
        },
      ],
    },
    // CreatedAt field: automatically set to the current date/time
    createdAt: {
      type: Date,
      default: Date.now, // Sets to current timestamp when document is created
    },
  });

  // Add partial unique index
userSchema.index(
  { "socialMediaAccounts.platform": 1, "socialMediaAccounts.username": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "socialMediaAccounts.platform": { $exists: true, $ne: null },
      "socialMediaAccounts.username": { $exists: true, $ne: null },
    },
  }
);

 // Add pre-save hook
userSchema.pre("save", function (next) {
  if (!this.socialMediaAccounts) {
    this.socialMediaAccounts = [];
  }
  next();
});

// Update createUser
userSchema.statics.createUser = async function (userData) {
  const data = {
    ...userData,
    socialMediaAccounts: userData.socialMediaAccounts || [],
  };
  const user = new this(data);
  return await user.save();
};

  // Static method: Find a user by email
userSchema.statics.findByEmail = async function (email) {
    // Find one user document where the email matches (case-insensitive)
    return await this.findOne({ email: email.toLowerCase() });
  };

  // Static method: Find a user by ID
userSchema.statics.findById = async function (userId) {
    // Find one user document by MongoDB ObjectId
    return await this.findOne({ _id: userId });
  };

  // Static method: Update a user’s details
userSchema.statics.updateUser = async function (userId, updateData) {
    // Find and update the user by ID, return the updated document
    return await this.findByIdAndUpdate(
      userId,
      { $set: updateData }, // Only update specified fields
      { new: true, runValidators: true } // Return updated document, validate changes
    );
  };

  // Static method: Delete a user
userSchema.statics.deleteUser = async function (userId) {
    // Find and delete the user by ID
    return await this.findByIdAndDelete(userId);
  };


  // Static method: Add a social media account to a user
userSchema.statics.addSocialMediaAccount = async function (userId, accountData) {
    // Find the user by ID and push the new account to socialMediaAccounts array
    return await this.findByIdAndUpdate(
      userId,
      { $push: { socialMediaAccounts: accountData } }, // Add new account
      { new: true, runValidators: true } // Return updated document, validate changes
    );
  };

  // Static method: Remove a social media account from a user
userSchema.statics.removeSocialMediaAccount = async function (
    userId,
    platform,
    username
  ) {
    // Find the user by ID and pull the account matching platform and username
    return await this.findByIdAndUpdate(
      userId,
      {
        $pull: {
          socialMediaAccounts: { platform, username }, // Remove matching account
        },
      },
      { new: true } // Return updated document
    );
  };

  // Static method: Get all users
userSchema.statics.getAllUsers = async function () {
    // Find all users in the collection
    return await this.find();
  };

  // Instance method: Update user’s password
userSchema.methods.updatePassword = async function (newPassword) {
    // Update the password field for this user instance
    this.password = newPassword;
    // Save the updated document
    return await this.save();
  };

  // Create the User model from the schema
// const User = mongoose.model("User", userSchema, "user_collection");

const User = mongoose.model("User", userSchema, "user_collection");

// Export the User model for use in other parts of the application
export default User;


import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
});

// Social Platform model
export const socialPlatforms = pgTable("social_platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  isActive: boolean("is_active").default(true),
  apiConfig: jsonb("api_config"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSocialPlatformSchema = createInsertSchema(socialPlatforms).pick({
  name: true,
  icon: true,
  color: true,
  isActive: true,
  apiConfig: true,
});

// Social Account model
export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  platformId: integer("platform_id").references(() => socialPlatforms.id),
  accountHandle: text("account_handle").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  profileData: jsonb("profile_data"),
  isConnected: boolean("is_connected").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const insertSocialAccountSchema = createInsertSchema(socialAccounts).pick({
  userId: true,
  platformId: true,
  accountHandle: true,
  accessToken: true,
  refreshToken: true,
  tokenExpiry: true,
  profileData: true,
  isConnected: true,
});

// Posts model
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  socialAccountId: integer("social_account_id").references(() => socialAccounts.id),
  platformPostId: text("platform_post_id").notNull(),
  content: text("content"),
  mediaUrls: jsonb("media_urls"),
  publishedAt: timestamp("published_at").notNull(),
  engagementData: jsonb("engagement_data"),
  sentiment: jsonb("sentiment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).pick({
  socialAccountId: true,
  platformPostId: true,
  content: true,
  mediaUrls: true,
  publishedAt: true,
  engagementData: true,
  sentiment: true,
});

// Hashtags model
export const hashtags = pgTable("hashtags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  postCount: integer("post_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHashtagSchema = createInsertSchema(hashtags).pick({
  name: true,
  postCount: true,
});

// PostHashtags junction table
export const postHashtags = pgTable("post_hashtags", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id),
  hashtagId: integer("hashtag_id").references(() => hashtags.id),
});

// Analytics data model
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  socialAccountId: integer("social_account_id").references(() => socialAccounts.id),
  date: timestamp("date").notNull(),
  metrics: jsonb("metrics").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnalyticsSchema = createInsertSchema(analytics).pick({
  socialAccountId: true,
  date: true,
  metrics: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SocialPlatform = typeof socialPlatforms.$inferSelect;
export type InsertSocialPlatform = z.infer<typeof insertSocialPlatformSchema>;

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Hashtag = typeof hashtags.$inferSelect;
export type InsertHashtag = z.infer<typeof insertHashtagSchema>;

export type PostHashtag = typeof postHashtags.$inferSelect;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

// Extended types for specific use cases
export type SentimentAnalysis = {
  score: number;
  positive: number;
  neutral: number;
  negative: number;
  keywords: {
    text: string;
    sentiment: string;
    score: number;
  }[];
};

export type EngagementData = {
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  clicks?: number;
  impressions?: number;
  reach?: number;
};

export type SocialMetrics = {
  followers: number;
  following?: number;
  totalPosts: number;
  engagementRate: number;
  impressions?: number;
  reach?: number;
};

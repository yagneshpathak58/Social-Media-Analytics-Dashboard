import cron from "node-cron";
import User from "../models/userModel.js";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// Function to refresh Twitter access token
async function refreshTwitterToken(userId, refreshToken) {
  try {
    const response = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWITTER_API_KEY}:${process.env.TWITTER_API_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.TWITTER_API_KEY,
      }),
    });

    const tokenData = await response.json();
    if (response.status !== 200) {
      console.error("Token refresh failed:", tokenData);
      return null;
    }

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

// Schedule token refresh every hour
export function startTokenRefreshJob() {
  cron.schedule("0 * * * *", async () => {
    console.log("Running token refresh job...");
    try {
      const users = await User.find({ "socialMediaAccounts.platform": "Twitter" });
      for (const user of users) {
        const twitterAccount = user.socialMediaAccounts.find(acc => acc.platform === "Twitter");
        if (twitterAccount && twitterAccount.refreshToken) {
          const tokens = await refreshTwitterToken(user._id, twitterAccount.refreshToken);
          if (tokens) {
            await User.updateOne(
              { _id: user._id, "socialMediaAccounts.platform": "Twitter" },
              {
                $set: {
                  "socialMediaAccounts.$.accessToken": tokens.accessToken,
                  "socialMediaAccounts.$.refreshToken": tokens.refreshToken,
                },
              }
            );
            console.log(`Refreshed tokens for user ${user._id}`);
          }
        }
      }
    } catch (error) {
      console.error("Error in token refresh job:", error);
    }
  });
}
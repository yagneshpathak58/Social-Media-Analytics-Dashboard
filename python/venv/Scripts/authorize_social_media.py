# Import required libraries
import tweepy
import requests
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import sys
import urllib.parse

# Load environment variables from .env file
load_dotenv()

# MongoDB connection setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://pathak:home1234@localhost:27017/SocialMediaAnalytics?authSource=admin")
client = MongoClient(MONGO_URI)
db = client["SocialMediaAnalytics"]
users_collection = db["user_collection"]

# Twitter API credentials
TWITTER_API_KEY = os.getenv("TWITTER_API_KEY")
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET")
TWITTER_CALLBACK_URL = os.getenv("TWITTER_CALLBACK_URL")

# Function to initiate Twitter OAuth
def initiate_twitter_oauth(user_id):
    """Initiate Twitter OAuth 1.0a flow and return authorization URL."""
    try:
        # Create OAuth1 handler
        auth = tweepy.OAuth1UserHandler(
            TWITTER_API_KEY,
            TWITTER_API_SECRET,
            callback=TWITTER_CALLBACK_URL
        )
        
        # Get authorization URL
        auth_url = auth.get_authorization_url()
        
        # Store request token in database for later use
        users_collection.update_one(
            {"_id": user_id},
            {"$set": {
                "twitter_oauth": {
                    "request_token": auth.request_token,
                    "user_id": user_id
                }
            }}
        )
        
        print(f"Twitter OAuth URL: {auth_url}")
        return auth_url
    except Exception as e:
        print(f"Error initiating Twitter OAuth: {e}")
        return None

# Function to handle Twitter callback
def handle_twitter_callback(user_id, oauth_token, oauth_verifier):
    """Handle Twitter callback, exchange verifier for access token, and update MongoDB."""
    try:
        # Retrieve request token from database
        user = users_collection.find_one({"_id": user_id, "twitter_oauth.request_token.oauth_token": oauth_token})
        if not user or "twitter_oauth" not in user:
            print("Invalid user or request token")
            return False

        request_token = user["twitter_oauth"]["request_token"]
        
        # Create OAuth1 handler with request token
        auth = tweepy.OAuth1UserHandler(
            TWITTER_API_KEY,
            TWITTER_API_SECRET
        )
        auth.request_token = request_token
        
        # Get access token
        access_token, access_token_secret = auth.get_access_token(oauth_verifier)
        
        # Create API client to fetch username
        client = tweepy.Client(
            consumer_key=TWITTER_API_KEY,
            consumer_secret=TWITTER_API_SECRET,
            access_token=access_token,
            access_token_secret=access_token_secret
        )
        
        # Fetch user info
        user_info = client.get_me(user_fields=["username"]).data
        username = user_info.username
        
        # Update socialMediaAccounts in MongoDB
        account_data = {
            "platform": "Twitter",
            "username": username,
            "accessToken": access_token,
            "accessTokenSecret": access_token_secret
        }
        
        result = users_collection.update_one(
            {"_id": user_id},
            {"$push": {"socialMediaAccounts": account_data}}
        )
        
        if result.modified_count > 0:
            print(f"Successfully added Twitter account for user {user_id}")
            # Clean up temporary oauth data
            users_collection.update_one(
                {"_id": user_id},
                {"$unset": {"twitter_oauth": ""}}
            )
            return True
        else:
            print("Failed to update user document")
            return False
    except Exception as e:
        print(f"Error handling Twitter callback: {e}")
        return False

# Main function to simulate OAuth flow
def main():
    if len(sys.argv) < 3:
        print("Usage: python authorize_social_media.py <platform> <user_id> [oauth_token oauth_verifier]")
        sys.exit(1)
    
    platform = sys.argv[1]
    user_id = sys.argv[2]
    
    if platform.lower() == "twitter":
        if len(sys.argv) == 3:
            # Initiate OAuth
            auth_url = initiate_twitter_oauth(user_id)
            if auth_url:
                print(f"Please visit this URL to authorize: {auth_url}")
                print("After authorizing, run the script again with oauth_token and oauth_verifier")
        elif len(sys.argv) == 5:
            # Handle callback
            oauth_token = sys.argv[3]
            oauth_verifier = sys.argv[4]
            success = handle_twitter_callback(user_id, oauth_token, oauth_verifier)
            print("Twitter authorization completed" if success else "Twitter authorization failed")
        else:
            print("Invalid arguments for Twitter")
    else:
        print(f"Platform {platform} not fully implemented in this script. Use backend for Instagram/Facebook.")

if __name__ == "__main__":
    main()
# Import required libraries
import pymongo
from pymongo import MongoClient
import tweepy
import requests
from dotenv import load_dotenv
import os
from datetime import datetime


# Load environment variables from .env file
load_dotenv()


# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["SocialMediaAnalytics"]  # Database name
users_collection = db["user_collection"]      # Users collection
posts_collection = db["posts_collection"]      # Posts collection
analytics_collection = db["analytics_collection"]  # Analytics collection

def fetch_twitter_posts(user):
    """
    Fetch recent tweets for a user using Twitter API v2.
    """
    # Get Twitter credentials from socialMediaAccounts
    twitter_creds = user["SocialMediaAnalytics"].get("twitter",{})
    access_token = twitter_creds.get("accessToken")
    access_token_secret = twitter_creds.get("accessTokenSecret")

    if not access_token or not access_token_secret:
        print("Twitter credentials missing for user", user["email"])
        return []
    
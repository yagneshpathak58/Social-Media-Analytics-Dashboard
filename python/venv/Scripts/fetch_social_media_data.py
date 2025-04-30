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
    
    # Initialize Twitter API (v1.1 for user timeline due to v2 limitations)
    auth = tweepy.OAuthHandler(
        os.getenv("TWITTER_API_KEY"),
        os.getenv("TWITTER_API_SECRET")
    )
    auth.set_access_token(access_token, access_token_secret)
    api = tweepy.API(auth, wait_on_rate_limit=True)
    
    try:
        # Fetch recent tweets (up to 10 for demo)
        tweets = api.user_timeline(count=10, tweet_mode="extended")
        posts = []
        
        for tweet in tweets:
            posts.append({
                "platform": "Twitter",
                "postId": str(tweet.id),
                "userId": user["_id"],
                "content": tweet.full_text,
                "postedAt": tweet.created_at,
                "likes": tweet.favorite_count,
                "comments": tweet.retweet_count,  # Approximation
                "shares": tweet.retweet_count,
                "hashtags": [tag["text"] for tag in tweet.entities.get("hashtags", [])],
                "sentiment": None  # To be updated by sentiment analysis
            })
        return posts
    except Exception as e:
        print(f"Error fetching Twitter posts: {str(e)}")
        return []

def fetch_instagram_posts(user):
    """
    Fetch recent Instagram posts using Instagram Graph API.
    """
    # Get Instagram credentials from socialMediaAccounts
    instagram_creds = user["socialMediaAccounts"].get("instagram", {})
    access_token = instagram_creds.get("accessToken")
    user_id = instagram_creds.get("userId")
    
    if not access_token or not user_id:
        print("Instagram credentials missing for user", user["email"])
        return []
    
    # Instagram Graph API endpoint
    url = f"https://graph.instagram.com/{user_id}/media"
    params = {
        "fields": "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
        "access_token": access_token,
        "limit": 10  # Fetch up to 10 posts
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        posts = []
        for media in data.get("data", []):
            posts.append({
                "platform": "Instagram",
                "postId": media["id"],
                "userId": user["_id"],
                "content": media.get("caption", ""),
                "postedAt": datetime.strptime(media["timestamp"], "%Y-%m-%dT%H:%M:%S%z"),
                "likes": media.get("like_count", 0),
                "comments": media.get("comments_count", 0),
                "shares": 0,  # Instagram API doesn't provide shares
                "hashtags": [tag.strip("#") for tag in media.get("caption", "").split() if tag.startswith("#")],
                "sentiment": None
            })
        return posts
    except Exception as e:
        print(f"Error fetching Instagram posts: {str(e)}")
        return []

def fetch_facebook_posts(user):
    """
    Fetch recent Facebook posts using Facebook Graph API.
    """
    # Get Facebook credentials from socialMediaAccounts
    facebook_creds = user["socialMediaAccounts"].get("facebook", {})
    access_token = facebook_creds.get("accessToken")
    page_id = facebook_creds.get("pageId")
    
    if not access_token or not page_id:
        print("Facebook credentials missing for user", user["email"])
        return []
    
    # Facebook Graph API endpoint
    url = f"https://graph.facebook.com/v20.0/{page_id}/posts"
    params = {
        "fields": "id,message,created_time,likes.summary(true),comments.summary(true),shares",
        "access_token": access_token,
        "limit": 10  # Fetch up to 10 posts
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        posts = []
        for post in data.get("data", []):
            posts.append({
                "platform":"Facebook",
                "postId":post["_id"],
                "userId": user["_id"],
                "content": post.get("message", ""),
                "postedAt": datetime.strptime(post["created_time"], "%Y-%m-%dT%H:%M:%S%z"),
                "likes": post.get("likes", {}).get("summary", {}).get("total_count", 0),
                "comments": post.get("comments", {}).get("summary", {}).get("total_count", 0),
                "shares": post.get("shares", {}).get("count", 0),
                "hashtags": [tag.strip("#") for tag in post.get("message", "").split() if tag.startswith("#")],
                "sentiment": None
            })
        return posts
    except Exception as e:
        print(f"Error fetching Facebook posts: {str(e)}")
        return []

def store_posts_and_analytics(posts):
    """
    Store posts in posts collection and compute/store analytics.
    """
    for post in posts:
        # Check if post already exists
        existing_post = posts_collection.find_one({
            "platform": post["platform"],
            "postId": post["postId"]
        })
        
        if existing_post:
            # Update existing post
            posts_collection.update_one(
                {"_id": existing_post["_id"]},
                {"$set": post}
            )
            print(f"Updated post {post['postId']} on {post['platform']}")
            post_id = existing_post["_id"]
        else:
            # Insert new post
            result = posts_collection.insert_one(post)
            print(f"Inserted post {post['postId']} on {post['platform']}")
            post_id = result.inserted_id
        
        # Calculate analytics
        engagement_rate, reach = calculate_engagement_rate(post)
        analytics_data = {
            "userId": post["userId"],
            "platform": post["platform"],
            "postId": post_id,
            "engagementRate": engagement_rate,
            "reach": reach,
            "impressions": reach * 1.5,  # Simplified
            "trend": "stable",
            "analyzedAt": datetime.utcnow()
        }
        
        # Check if analytics exists
        existing_analytics = analytics_collection.find_one({
            "postId": post_id,
            "platform": post["platform"]
        })
        
        if existing_analytics:
            # Update existing analytics
            analytics_collection.update_one(
                {"_id": existing_analytics["_id"]},
                {"$set": analytics_data}
            )
            print(f"Updated analytics for post {post['postId']} on {post['platform']}")
        else:
            # Insert new analytics
            analytics_collection.insert_one(analytics_data)
            print(f"Inserted analytics for post {post['postId']} on {post['platform']}")

def calculate_engagement_rate(post):
    """
    Calculate engagement rate for a post (reused from calculate_analytics.py).
    """
    likes = post.get("likes", 0)
    comments = post.get("comments", 0)
    shares = post.get("shares", 0)
    total_engagement = likes + comments + shares
    reach = total_engagement + 100  # Simplified
    engagement_rate = (total_engagement / reach) if reach > 0 else 0
    return engagement_rate, reach

def main():
    """
    Main function to fetch social media data and store in MongoDB.
    """
    try:
        print("Starting social media data fetch...")
        
        # Fetch all users with socialMediaAccounts
        users = users_collection.find({"socialMediaAccounts": {"$exists": True}})
        
        for user in users:
            print(f"Processing user: {user['email']}")
            
            # Fetch posts from each platform
            twitter_posts = fetch_twitter_posts(user)
            instagram_posts = fetch_instagram_posts(user)
            facebook_posts = fetch_facebook_posts(user)
            
            # Combine all posts
            all_posts = twitter_posts + instagram_posts + facebook_posts
            
            if all_posts:
                # Store posts and analytics
                store_posts_and_analytics(all_posts)
            else:
                print(f"No posts fetched for user {user['email']}")
        
        print("Social media data fetch completed.")
    except Exception as e:
        print(f"Error during data fetch: {str(e)}")
    finally:
        # Close MongoDB connection
        client.close()

if __name__ == "__main__":
    main()
    
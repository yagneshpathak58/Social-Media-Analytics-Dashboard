# Import required libraries
import pymongo
from pymongo import MongoClient
import pandas as pd
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Get MongoDB URI from environment variables
MONGO_URI = os.getenv('MONGO_URI')

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["SocialMediaAnalytics"] #database name
posts_collection = db["posts_collection"] #collection name
analytics_collection = db["analytics_collection"] #collection name

# Function to calculate analytics
def calculate_engagement_rate(post):
    """ Calculate engagement rate for a given post
        Formula: (likes + comments + shares) /reach
        Assume reach = likes + comments + shares + 100 (simplified for demo)
    """

    # Extract engament matrics
    likes = post.get("likes", 0)
    comments = post.get("comments", 0)
    shares = post.get("shares", 0)
    
    # Calculate total engagement
    total_engagement = likes + comments + shares

    # Estimate reach (simplified: adjust based on actual API data)
    reach = total_engagement + 100 # Placeholder  value 

    # Calculate engagement rate (avoid division by zero)
    engagement_rate = (total_engagement / reach) if reach > 0 else 0

    return engagement_rate, reach

def analyze_posts():
    """
    Analyze all posts and store analytics in the analytics_collection.
    """
    # Fetch all posts from the posts collection
    posts  = posts_collection.find()

    # Convert to list for processing
    posts_list = list(posts)

    # If no posts, exit
    if not posts_list:
        print("No posts found to analyze.")
        return
    
    # Process each post
    for post in posts_list:

        # Calculate engagement rate and reach
        engagement_rate, reach = calculate_engagement_rate(post)

        # Prepare analytics data
        analytics_data = {

            "userId": post["userId"],
            "platform": post["platform"],
            "postId": post["_id"],
            "engagementRate": engagement_rate,
            "reach": reach,
            "impressions": reach*1.5, # Simplified: adjust based on API data
            "trend": "stable", # Placeholder: implement trend analysis if needed
            "analyzedAt": datetime.utcnow()

        }

        # Check if analytics already exists for this post
        existing_analytics = analytics_collection.find_one({
            "postId": post["_id"],
            "platform": post["platform"]
        })

        if existing_analytics:
            # Update existing analytics
            analytics_collection.update_one(
                {"_id": existing_analytics["_id"]},
                {"$set": analytics_data}
            )
            print(f"Updated analytics for post {post['postId']} on {post['platform']} ")

        else:
            # Insert new analytics
            analytics_collection.insert_one(analytics_data)
            print(f"Inserted analytics for post {post['postId']} on {post['platform']}")

def main():
    """
    Main function to run the analytics calculation.
    """
    try:
        print("Starting analytics calculation...")
        analyze_posts()
        print("Analytics calculation completed.")

    except Exception as e:
        print(f"Error during analytics calculation: {str(e)}")

    finally:
        #Close MongoDB connection 
        client.close()

if __name__ == '__main__':
    main()

            
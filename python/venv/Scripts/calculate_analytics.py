# # Import required libraries
# import pymongo
# from pymongo import MongoClient
# import pandas as pd
# from dotenv import load_dotenv
# import os
# from datetime import datetime

# # Load environment variables from .env file
# load_dotenv()

# # Get MongoDB URI from environment variables
# MONGO_URI = os.getenv('MONGO_URI')

# # Connect to MongoDB
# client = MongoClient(MONGO_URI)
# db = client["SocialMediaAnalytics"] #database name
# posts_collection = db["posts_collection"] #collection name
# analytics_collection = db["analytics_collection"] #collection name

# # Function to calculate analytics
# def calculate_engagement_rate(post):
#     """ Calculate engagement rate for a given post
#         Formula: (likes + comments + shares) /reach
#         Assume reach = likes + comments + shares + 100 (simplified for demo)
#     """

#     # Extract engament matrics
#     likes = post.get("likes", 0)
#     comments = post.get("comments", 0)
#     shares = post.get("shares", 0)
    
#     # Calculate total engagement
#     total_engagement = likes + comments + shares

#     # Estimate reach (simplified: adjust based on actual API data)
#     reach = total_engagement + 100 # Placeholder  value 

#     # Calculate engagement rate (avoid division by zero)
#     engagement_rate = (total_engagement / reach) if reach > 0 else 0

#     return engagement_rate, reach

# def analyze_posts():
#     """
#     Analyze all posts and store analytics in the analytics_collection.
#     """
#     # Fetch all posts from the posts collection
#     posts  = posts_collection.find()

#     # Convert to list for processing
#     posts_list = list(posts)

#     # If no posts, exit
#     if not posts_list:
#         print("No posts found to analyze.")
#         return
    
#     # Process each post
#     for post in posts_list:

#         # Calculate engagement rate and reach
#         engagement_rate, reach = calculate_engagement_rate(post)

#         # Prepare analytics data
#         analytics_data = {

#             "userId": post["userId"],
#             "platform": post["platform"],
#             "postId": post["_id"],
#             "engagementRate": engagement_rate,
#             "reach": reach,
#             "impressions": reach*1.5, # Simplified: adjust based on API data
#             "trend": "stable", # Placeholder: implement trend analysis if needed
#             "analyzedAt": datetime.utcnow()

#         }

#         # Check if analytics already exists for this post
#         existing_analytics = analytics_collection.find_one({
#             "postId": post["_id"],
#             "platform": post["platform"]
#         })

#         if existing_analytics:
#             # Update existing analytics
#             analytics_collection.update_one(
#                 {"_id": existing_analytics["_id"]},
#                 {"$set": analytics_data}
#             )
#             print(f"Updated analytics for post {post['postId']} on {post['platform']} ")

#         else:
#             # Insert new analytics
#             analytics_collection.insert_one(analytics_data)
#             print(f"Inserted analytics for post {post['postId']} on {post['platform']}")

# def main():
#     """
#     Main function to run the analytics calculation.
#     """
#     try:
#         print("Starting analytics calculation...")
#         analyze_posts()
#         print("Analytics calculation completed.")

#     except Exception as e:
#         print(f"Error during analytics calculation: {str(e)}")

#     finally:
#         #Close MongoDB connection 
#         client.close()

# if __name__ == '__main__':
#     main()

            


import pymongo
from pymongo import MongoClient
import pandas as pd
from dotenv import load_dotenv
import os
from datetime import datetime
import matplotlib.pyplot as plt
import json
import sys

# Load environment variables from .env file
load_dotenv()

# Get MongoDB URI from environment variables
MONGO_URI = os.getenv('MONGO_URI')

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["SocialMediaAnalytics"]
posts_collection = db["posts_collection"]
analytics_collection = db["analytics_collection"]

# Ensure graphs directory exists
GRAPHS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../graphs')
os.makedirs(GRAPHS_DIR, exist_ok=True)

# Function to calculate analytics
def calculate_engagement_rate(post):
    """Calculate engagement rate for a given post
       Formula: (likes + comments + shares) / reach
       Assume reach = likes + comments + shares + 100 (simplified for demo)
    """
    likes = post.get("likes", 0)
    comments = post.get("comments", 0)
    shares = post.get("shares", 0)
    
    total_engagement = likes + comments + shares
    reach = total_engagement + 100  # Placeholder value
    engagement_rate = (total_engagement / reach) if reach > 0 else 0

    return engagement_rate, reach

def generate_graphs(posts, post_ids):
    """Generate graphs for engagement rate, reach, and impressions."""
    graphs = []
    
    # Convert posts to DataFrame
    df = pd.DataFrame([{
        "postId": str(post["_id"]),
        "engagementRate": analytics_collection.find_one({"postId": post["_id"]})["engagementRate"],
        "reach": analytics_collection.find_one({"postId": post["_id"]})["reach"],
        "impressions": analytics_collection.find_one({"postId": post["_id"]})["impressions"],
        "content": post["content"][:20] + "..."  # Shortened for labels
    } for post in posts])

    # Graph 1: Engagement Rate Bar Plot
    plt.figure(figsize=(8, 6))
    plt.bar(df["content"], df["engagementRate"], color='blue')
    plt.title("Engagement Rate per Post")
    plt.xlabel("Post Content")
    plt.ylabel("Engagement Rate")
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    engagement_graph_path = os.path.join(GRAPHS_DIR, f"engagement_rate_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.png")
    plt.savefig(engagement_graph_path)
    plt.close()
    graphs.append(engagement_graph_path)

    # Graph 2: Reach Bar Plot
    plt.figure(figsize=(8, 6))
    plt.bar(df["content"], df["reach"], color='green')
    plt.title("Reach per Post")
    plt.xlabel("Post Content")
    plt.ylabel("Reach")
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    reach_graph_path = os.path.join(GRAPHS_DIR, f"reach_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.png")
    plt.savefig(reach_graph_path)
    plt.close()
    graphs.append(reach_graph_path)

    # Graph 3: Impressions Bar Plot
    plt.figure(figsize=(8, 6))
    plt.bar(df["content"], df["impressions"], color='orange')
    plt.title("Impressions per Post")
    plt.xlabel("Post Content")
    plt.ylabel("Impressions")
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    impressions_graph_path = os.path.join(GRAPHS_DIR, f"impressions_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.png")
    plt.savefig(impressions_graph_path)
    plt.close()
    graphs.append(impressions_graph_path)

    return graphs

def analyze_posts(post_ids):
    """
    Analyze specified posts and store analytics in the analytics_collection.
    Return graph file paths.
    """
    # Fetch specified posts
    post_ids = post_ids.split(",") if post_ids else []
    if not post_ids:
        print("No post IDs provided.")
        return []

    from bson.objectid import ObjectId
    posts = posts_collection.find({"_id": {"$in": [ObjectId(pid) for pid in post_ids]}})

    posts_list = list(posts)
    if not posts_list:
        print("No posts found for the provided IDs.")
        return []

    # Process each post
    for post in posts_list:
        engagement_rate, reach = calculate_engagement_rate(post)

        analytics_data = {
            "userId": post["userId"],
            "platform": post["platform"],
            "postId": post["_id"],
            "engagementRate": engagement_rate,
            "reach": reach,
            "impressions": reach * 1.5,  # Simplified
            "trend": "stable",  # Placeholder
            "analyzedAt": datetime.utcnow()
        }

        # Check if analytics already exists
        existing_analytics = analytics_collection.find_one({
            "postId": post["_id"],
            "platform": post["platform"]
        })

        if existing_analytics:
            analytics_collection.update_one(
                {"_id": existing_analytics["_id"]},
                {"$set": analytics_data}
            )
            print(f"Updated analytics for post {post['postId']} on {post['platform']}")
        else:
            analytics_collection.insert_one(analytics_data)
            print(f"Inserted analytics for post {post['postId']} on {post['platform']}")

    # Generate graphs
    graphs = generate_graphs(posts_list, post_ids)

    return graphs

def main():
    """
    Main function to run the analytics calculation.
    """
    try:
        print("Starting analytics calculation...")
        post_ids = sys.argv[1] if len(sys.argv) > 1 else ""
        graphs = analyze_posts(post_ids)
        # Output JSON with graph paths
        print(json.dumps({"graphs": graphs}))
        print("Analytics calculation completed.")

    except Exception as e:
        print(f"Error during analytics calculation: {str(e)}", file=sys.stderr)
        sys.exit(1)

    finally:
        client.close()

if __name__ == '__main__':
    main()
import base64
import hashlib
import os
import sys
import urllib.parse
import secrets
import requests
import logging
import traceback
from pymongo import MongoClient
from dotenv import load_dotenv
from bson.objectid import ObjectId, InvalidId
from datetime import datetime, timedelta

# Custom stream handler to handle Unicode encoding safely
class UnicodeSafeStreamHandler(logging.StreamHandler):
    def emit(self, record):
        try:
            msg = self.format(record)
            self.stream.write(msg.encode('utf-8', errors='replace').decode('utf-8') + self.terminator)
            self.flush()
        except Exception:
            self.handleError(record)

# Set up logging to file and console with UTF-8 encoding
log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fetch_social_media_data.log")
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# File handler with UTF-8 encoding
file_handler = logging.FileHandler(log_file, encoding='utf-8')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))

# Console handler with safe Unicode handling
console_handler = UnicodeSafeStreamHandler(sys.stdout)
console_handler.setLevel(logging.DEBUG)
console_handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))

# Add handlers to logger
logger.handlers = [file_handler, console_handler]

# File-only logger for sensitive data
file_only_logger = logging.getLogger('file_only')
file_only_logger.setLevel(logging.DEBUG)
file_only_logger.handlers = [file_handler]

# Verify required dependencies
try:
    import pymongo
    import requests
    import dotenv
except ImportError as e:
    logger.error(f"Missing required dependency: {e}")
    sys.exit(1)

# Load environment variables from .env file in the script's directory
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, ".env")
load_dotenv(env_path)

# MongoDB connection setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://yagneshadmin:admin123@cluster0.qy12l4p.mongodb.net/SocialMediaAnalytics?retryWrites=true&w=majority")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()  # Test connection
    db = client["SocialMediaAnalytics"]
    users_collection = db["user_collection"]
    posts_collection = db["posts_collection"]
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    sys.exit(1)

# Twitter API credentials
TWITTER_API_KEY = os.getenv("TWITTER_API_KEY")
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET")
TWITTER_CALLBACK_URL_POSTS = os.getenv("TWITTER_CALLBACK_URL_POSTS")
FRONTEND_URL = os.getenv("FRONTEND_URL")

# Debug environment variables (log to file only)
file_only_logger.debug(f"Script directory: {script_dir}")
file_only_logger.debug(f"Looking for .env at: {env_path}")
file_only_logger.debug(f"TWITTER_API_KEY: {'[SET]' if TWITTER_API_KEY else 'MISSING'}")
file_only_logger.debug(f"TWITTER_API_SECRET: {'[SET]' if TWITTER_API_SECRET else 'MISSING'}")
file_only_logger.debug(f"TWITTER_CALLBACK_URL_POSTS: {TWITTER_CALLBACK_URL_POSTS if TWITTER_CALLBACK_URL_POSTS else 'MISSING'}")
file_only_logger.debug(f"MONGO_URI: {MONGO_URI}")
file_only_logger.debug(f"FRONTEND_URL: {FRONTEND_URL if FRONTEND_URL else 'MISSING'}")

# Validate environment variables
if not all([TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_CALLBACK_URL_POSTS, FRONTEND_URL]):
    logger.error("Missing Twitter API credentials, callback URL, or frontend URL")
    sys.exit(1)

# Function to convert string to ObjectId
def to_objectid(user_id):
    """Convert a string to ObjectId, return None if invalid."""
    try:
        return ObjectId(user_id)
    except InvalidId:
        logger.error(f"Invalid ObjectId format for user_id: {user_id}")
        return None

# Function to generate a valid PKCE code verifier
def generate_code_verifier():
    """Generate a PKCE code verifier (96 characters, URL-safe)."""
    verifier = secrets.token_urlsafe(96)[:96]  # Strictly 96 characters
    file_only_logger.debug(f"Generated code_verifier: {verifier} (length: {len(verifier)})")
    return verifier

# Function to generate code challenge from code verifier
def generate_code_challenge(code_verifier):
    """Generate a PKCE code challenge from the code verifier."""
    sha256_hash = hashlib.sha256(code_verifier.encode()).digest()
    code_challenge = base64.urlsafe_b64encode(sha256_hash).decode().rstrip("=")
    file_only_logger.debug(f"Generated code_challenge: {code_challenge} (length: {len(code_challenge)})")
    return code_challenge

# Function to parse Twitter's created_at format
def parse_twitter_date(date_str):
    """Parse Twitter's created_at date string to datetime."""
    try:
        return datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
    except ValueError:
        try:
            return datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ")
        except ValueError as e:
            logger.error(f"Error parsing date {date_str}: {e}")
            return datetime.utcnow()

# Function to refresh access token
def refresh_access_token(user_id, refresh_token):
    """Refresh Twitter access token using refresh token."""
    try:
        token_url = "https://api.twitter.com/2/oauth2/token"
        auth_header = base64.b64encode(
            f"{TWITTER_API_KEY}:{TWITTER_API_SECRET}".encode()
        ).decode()
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {auth_header}"
        }
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": TWITTER_API_KEY
        }

        response = requests.post(token_url, headers=headers, data=data, timeout=10)
        token_data = response.json()
        file_only_logger.debug(f"Token refresh response: {token_data}")

        if response.status_code != 200:
            logger.error(f"Token refresh failed: {token_data.get('error_description', 'Unknown error')}")
            return None

        new_access_token = token_data.get("access_token")
        new_refresh_token = token_data.get("refresh_token", refresh_token)  # Update if new refresh token provided

        # Update user's socialMediaAccounts
        oid = to_objectid(user_id)
        if not oid:
            return None

        result = users_collection.update_one(
            {"_id": oid, "socialMediaAccounts.refreshToken": refresh_token},
            {
                "$set": {
                    "socialMediaAccounts.$.accessToken": new_access_token,
                    "socialMediaAccounts.$.refreshToken": new_refresh_token
                }
            }
        )
        if result.matched_count == 0:
            logger.error(f"Failed to update access token for user_id: {user_id}")
            return None

        file_only_logger.debug(f"Refreshed access token: {new_access_token[:10]}...")
        return new_access_token
    except Exception as e:
        logger.error(f"Error refreshing access token: {e}")
        return None

# Function to initiate Twitter OAuth 2.0 for post fetching
def initiate_twitter_post_fetch(user_id):
    """Initiate Twitter OAuth 2.0 flow for post fetching and return authorization URL."""
    try:
        file_only_logger.debug(f"Initiating Twitter post fetch for user_id: {user_id}")
        oid = to_objectid(user_id)
        if not oid:
            return None

        user = users_collection.find_one({"_id": oid})
        if not user:
            logger.error(f"No user found with _id: {user_id}")
            return None
        file_only_logger.debug(f"Found user: {user.get('email', 'No email')}")

        state = secrets.token_hex(16)
        code_verifier = generate_code_verifier()
        code_challenge = generate_code_challenge(code_verifier)

        file_only_logger.debug(f"Raw redirect_uri: {TWITTER_CALLBACK_URL_POSTS}")
        encoded_redirect_uri = urllib.parse.quote(TWITTER_CALLBACK_URL_POSTS)
        file_only_logger.debug(f"Encoded redirect_uri: {encoded_redirect_uri}")

        auth_url = (
            "https://twitter.com/i/oauth2/authorize?"
            f"response_type=code"
            f"&client_id={TWITTER_API_KEY}"
            f"&redirect_uri={encoded_redirect_uri}"
            f"&scope={urllib.parse.quote('tweet.read users.read offline.access')}"
            f"&state={state}"
            f"&code_challenge={code_challenge}"
            f"&code_challenge_method=S256"
        )

        if not auth_url.startswith("https://twitter.com/i/oauth2/authorize?"):
            logger.error(f"Invalid OAuth URL format: {auth_url}")
            return None

        result = users_collection.update_one(
            {"_id": oid},
            {
                "$set": {
                    "twitter_post_oauth": {
                        "state": state,
                        "userId": user_id,
                        "codeVerifier": code_verifier,
                        "posts": []
                    }
                }
            }
        )
        if result.matched_count == 0:
            logger.error(f"Failed to update twitter_post_oauth for _id: {user_id}")
            return None

        file_only_logger.debug(f"Stored OAuth data: state={state}, userId={user_id}, codeVerifier={code_verifier}")
        file_only_logger.info(f"Twitter OAuth URL: {auth_url}")
        return auth_url
    except Exception as e:
        logger.error(f"Error initiating Twitter post fetch: {e}")
        logger.error(traceback.format_exc())
        return None

# Function to handle Twitter OAuth 2.0 callback for post fetching
def handle_twitter_post_callback(user_id, state, code):
    """Handle Twitter OAuth 2.0 callback, fetch posts, and store temporarily."""
    try:
        file_only_logger.debug(f"Handling callback: user_id={user_id}, state={state}, code={code[:10]}...")
        oid = to_objectid(user_id)
        if not oid:
            return None

        user = users_collection.find_one({"_id": oid, "twitter_post_oauth.state": state})
        if not user or "twitter_post_oauth" not in user:
            logger.error("Invalid user or state")
            return None
        file_only_logger.debug(f"Found user: {user.get('email', 'No email')}")

        code_verifier = user["twitter_post_oauth"]["codeVerifier"]
        file_only_logger.debug(f"Retrieved OAuth data: userId={user_id}, state={state}, codeVerifier={code_verifier}")

        token_url = "https://api.twitter.com/2/oauth2/token"
        auth_header = base64.b64encode(
            f"{TWITTER_API_KEY}:{TWITTER_API_SECRET}".encode()
        ).decode()
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {auth_header}"
        }
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": TWITTER_CALLBACK_URL_POSTS,
            "client_id": TWITTER_API_KEY,
            "code_verifier": code_verifier
        }

        file_only_logger.debug("Sending token exchange request")
        response = requests.post(token_url, headers=headers, data=data, timeout=10)
        token_data = response.json()
        file_only_logger.debug(f"Token exchange response: {token_data}")

        if response.status_code != 200:
            logger.error(f"Token exchange failed: {token_data.get('error_description', 'Unknown error')}")
            return None

        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        file_only_logger.debug(f"Access token: {access_token[:10]}...")
        if refresh_token:
            file_only_logger.debug(f"Refresh token: {refresh_token[:10]}...")

        user_info_url = "https://api.twitter.com/2/users/me?user.fields=id,username"
        headers = {"Authorization": f"Bearer {access_token}"}
        file_only_logger.debug("Fetching user info")
        user_response = requests.get(user_info_url, headers=headers, timeout=10)
        user_data = user_response.json()
        file_only_logger.debug(f"User info response: {user_data}")

        if user_response.status_code != 200:
            logger.error(f"Failed to fetch user info: {user_data.get('error_description', 'Unknown error')}")
            return None

        twitter_user_id = user_data["data"]["id"]
        username = user_data["data"]["username"]
        file_only_logger.debug(f"Twitter user ID: {twitter_user_id}, Username: {username}")

        tweets_url = f"https://api.twitter.com/2/users/{twitter_user_id}/tweets?tweet.fields=id,text,created_at,public_metrics,entities&max_results=10"
        file_only_logger.debug("Fetching tweets")
        tweets_response = requests.get(tweets_url, headers=headers, timeout=10)
        tweets_data = tweets_response.json()
        file_only_logger.debug(f"Tweets response: {tweets_data}")

        if tweets_response.status_code != 200:
            logger.error(f"Failed to fetch tweets: {tweets_data.get('error_description', 'Unknown error')}")
            return None

        posts = []
        for tweet in tweets_data.get("data", []):
            post = {
                "platform": "Twitter",
                "postId": tweet["id"],
                "userId": user_id,  # Store as string for consistency
                "content": tweet["text"],
                "postedAt": parse_twitter_date(tweet["created_at"]).isoformat(),
                "likes": tweet["public_metrics"]["like_count"],
                "comments": tweet["public_metrics"]["reply_count"],
                "shares": tweet["public_metrics"]["retweet_count"],
                "hashtags": [tag["tag"] for tag in tweet.get("entities", {}).get("hashtags", [])],
                "sentiment": None
            }
            posts.append(post)

        logger.info(f"Fetched {len(posts)} posts")

        result = users_collection.update_one(
            {"_id": oid},
            {
                "$set": {
                    "twitter_post_oauth": {
                        "state": state,
                        "userId": user_id,
                        "codeVerifier": code_verifier,
                        "posts": posts
                    }
                }
            }
        )
        if result.matched_count == 0:
            logger.error(f"Failed to update twitter_post_oauth for _id: {user_id}")
            return None

        users_collection.update_one(
            {"_id": oid},
            {"$unset": {"twitter_oauth": ""}}
        )

        redirect_url = f"{FRONTEND_URL}/select-post?userId={user_id}&state={state}"
        logger.info(f"Redirecting to: {redirect_url}")
        return redirect_url
    except Exception as e:
        logger.error(f"Error handling Twitter post callback: {e}")
        logger.error(traceback.format_exc())
        return None

# Main function to simulate OAuth flow
def main():
    try:
        file_only_logger.debug(f"Command-line arguments: {sys.argv}")
        if len(sys.argv) < 3:
            logger.error("Usage: python fetch_social_media _data.py <platform> <user_id> [state code_or_file]")
            sys.exit(1)

        platform = sys.argv[1]
        user_id = sys.argv[2]

        if platform.lower() == "twitter":
            if len(sys.argv) == 3:
                auth_url = initiate_twitter_post_fetch(user_id)
                if auth_url:
                    print(auth_url)  # Output only the URL to stdout
                else:
                    logger.error("Failed to initiate Twitter post fetch")
                    sys.exit(1)
            elif len(sys.argv) == 5:
                state = sys.argv[3]
                code_or_file = sys.argv[4]
                if os.path.isfile(code_or_file):
                    with open(code_or_file, 'r') as f:
                        code = f.read().strip()
                    file_only_logger.debug(f"Read code from file: {code[:10]}...")
                else:
                    code = code_or_file
                redirect_url = handle_twitter_post_callback(user_id, state, code)
                if redirect_url:
                    print(redirect_url)  # Output only the URL to stdout
                else:
                    logger.error("Twitter post fetch failed")
                    sys.exit(1)
            else:
                logger.error("Invalid arguments for Twitter")
                sys.exit(1)
        else:
            logger.error(f"Platform {platform} not supported in this script.")
            sys.exit(1)
    except Exception as e:
        logger.error(f"Main function error: {e}")
        logger.error(traceback.format_exc())
        sys.exit(1)

if __name__ == "__main__":
    main()
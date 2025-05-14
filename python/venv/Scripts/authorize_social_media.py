import base64
import hashlib
import os
import re
import sys
import urllib.parse
import secrets
from pymongo import MongoClient
from dotenv import load_dotenv
import requests
from bson.objectid import ObjectId, InvalidId

# Load environment variables from .env file in the script's directory
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, ".env")
load_dotenv(env_path)

# MongoDB connection setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://yagneshadmin:admin123@cluster0.qy12l4p.mongodb.net/SocialMediaAnalytics?retryWrites=true&w=majority")
client = MongoClient(MONGO_URI)
db = client["SocialMediaAnalytics"]
users_collection = db["user_collection"]

# Twitter API credentials
TWITTER_API_KEY = os.getenv("TWITTER_API_KEY")
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET")
TWITTER_CALLBACK_URL = os.getenv("TWITTER_CALLBACK_URL")

# Debug environment variables
print(f"Script directory: {script_dir}")
print(f"Looking for .env at: {env_path}")
print(f"TWITTER_API_KEY: {'[SET]' if TWITTER_API_KEY else 'MISSING'}")
print(f"TWITTER_API_SECRET: {'[SET]' if TWITTER_API_SECRET else 'MISSING'}")
print(f"TWITTER_CALLBACK_URL: {TWITTER_CALLBACK_URL if TWITTER_CALLBACK_URL else 'MISSING'}")
print(f"MONGO_URI: {MONGO_URI}")

# Validate environment variables
if not all([TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_CALLBACK_URL]):
    print("Error: Missing Twitter API credentials or callback URL")
    sys.exit(1)

# Function to convert string to ObjectId
def to_objectid(user_id):
    """Convert a string to ObjectId, return None if invalid."""
    try:
        return ObjectId(user_id)
    except InvalidId:
        print(f"Error: Invalid ObjectId format for user_id: {user_id}")
        return None

# Function to generate a valid PKCE code verifier
def generate_code_verifier():
    """Generate a PKCE code verifier (43-128 characters, URL-safe)."""
    return secrets.token_urlsafe(64)[:64]  # 64 characters, URL-safe

# Function to generate code challenge from code verifier
def generate_code_challenge(code_verifier):
    """Generate a PKCE code challenge from the code verifier."""
    sha256_hash = hashlib.sha256(code_verifier.encode()).digest()
    code_challenge = base64.urlsafe_b64encode(sha256_hash).decode().rstrip("=")
    return code_challenge

# Function to initiate Twitter OAuth 2.0
def initiate_twitter_oauth(user_id):
    """Initiate Twitter OAuth 2.0 flow and return authorization URL."""
    try:
        # Convert user_id to ObjectId
        oid = to_objectid(user_id)
        if not oid:
            return None

        # Validate user exists
        user = users_collection.find_one({"_id": oid})
        if not user:
            print(f"Error: No user found with _id: {user_id}")
            return None
        print(f"Found user: {user.get('email', 'No email')}")

        # Generate state and PKCE parameters
        state = secrets.token_hex(16)
        code_verifier = generate_code_verifier()
        code_challenge = generate_code_challenge(code_verifier)

        # Construct authorization URL
        auth_url = (
            "https://twitter.com/i/oauth2/authorize?"
            f"response_type=code"
            f"&client_id={TWITTER_API_KEY}"
            f"&redirect_uri={urllib.parse.quote(TWITTER_CALLBACK_URL)}"
            f"&scope={urllib.parse.quote('tweet.read users.read offline.access')}"
            f"&state={state}"
            f"&code_challenge={code_challenge}"
            f"&code_challenge_method=S256"
        )

        # Store OAuth data in MongoDB
        result = users_collection.update_one(
            {"_id": oid},
            {
                "$set": {
                    "twitter_oauth": {
                        "state": state,
                        "userId": user_id,
                        "codeVerifier": code_verifier
                    }
                }
            }
        )
        if result.matched_count == 0:
            print(f"Error: Failed to update twitter_oauth for _id: {user_id}")
            return None

        print(f"Twitter OAuth URL: {auth_url}")
        print(f"Stored OAuth data: state={state}, userId={user_id}, codeVerifier={code_verifier}")
        return auth_url
    except Exception as e:
        print(f"Error initiating Twitter OAuth: {e}")
        return None

# Function to handle Twitter OAuth 2.0 callback
def handle_twitter_callback(user_id, state, code):
    """Handle Twitter OAuth 2.0 callback, exchange code for access token, and update MongoDB."""
    try:
        # Convert user_id to ObjectId
        oid = to_objectid(user_id)
        if not oid:
            return False

        # Retrieve OAuth data from MongoDB
        user = users_collection.find_one({"_id": oid, "twitter_oauth.state": state})
        if not user or "twitter_oauth" not in user:
            print("Invalid user or state")
            return False
        print(f"Found user: {user.get('email', 'No email')}")

        code_verifier = user["twitter_oauth"]["codeVerifier"]
        print(f"Retrieved OAuth data: userId={user_id}, state={state}, codeVerifier={code_verifier}")

        # Prepare token exchange request
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
            "redirect_uri": TWITTER_CALLBACK_URL,
            "client_id": TWITTER_API_KEY,
            "code_verifier": code_verifier
        }

        # Exchange code for access token
        response = requests.post(token_url, headers=headers, data=data)
        token_data = response.json()
        print(f"Token exchange response: {token_data}")

        if response.status_code != 200:
            print(f"Token exchange failed: {token_data.get('error_description', 'Unknown error')}")
            return False

        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        print(f"Access token: {access_token[:10]}...")
        if refresh_token:
            print(f"Refresh token: {refresh_token[:10]}...")

        # Fetch user info
        user_info_url = "https://api.twitter.com/2/users/me?user.fields=username"
        headers = {"Authorization": f"Bearer {access_token}"}
        user_response = requests.get(user_info_url, headers=headers)
        user_data = user_response.json()
        print(f"User info response: {user_data}")

        if user_response.status_code != 200:
            print(f"Failed to fetch user info: {user_data.get('error_description', 'Unknown error')}")
            return False

        username = user_data["data"]["username"]
        print(f"Twitter username: {username}")

        # Update socialMediaAccounts in MongoDB
        account_data = {
            "platform": "Twitter",
            "username": username,
            "accessToken": access_token
        }
        if refresh_token:
            account_data["refreshToken"] = refresh_token

        print(f"Preparing to update with account_data: {account_data}")
        result = users_collection.update_one(
            {"_id": oid},
            {"$push": {"socialMediaAccounts": account_data}}
        )

        if result.matched_count == 0:
            print(f"Error: No document found for _id: {user_id}")
            return False
        if result.modified_count == 0:
            print("Failed to update socialMediaAccounts (no changes made)")
            return False
        users_collection.update_one(
            {"_id": oid},
            {"$unset": {"twitter_oauth": ""}}
        )

        print("Twitter authorization completed")
        updated_user = users_collection.find_one({"_id": oid})
        print(f"Updated user document: {updated_user}")
        return True        
    except Exception as e:
        print(f"Error handling Twitter OAuth callback: {e}")
        return False

# Main function to simulate OAuth flow
def main():
    if len(sys.argv) < 3:
        print("Usage: python authorize_social_media.py <platform> <user_id> [state code]")
        sys.exit(1)

    platform = sys.argv[1]
    user_id = sys.argv[2]

    if platform.lower() == "twitter":
        if len(sys.argv) == 3:
            # Initiate OAuth
            auth_url = initiate_twitter_oauth(user_id)
            if auth_url:
                print(f"Please visit this URL to authorize: {auth_url}")
                print("After authorizing, run the script again with state and code")
        elif len(sys.argv) == 5:
            # Handle callback
            state = sys.argv[3]
            code = sys.argv[4]
            success = handle_twitter_callback(user_id, state, code)
            print("Twitter authorization completed" if success else "Twitter authorization failed")
        else:
            print("Invalid arguments for Twitter")
    else:
        print(f"Platform {platform} not supported in this script.")

if __name__ == "__main__":
    main()
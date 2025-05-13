import pymongo
from pymongo import MongoClient
import pandas as pd
from textblob import TextBlob
from dotenv import load_dotenv
import os
from datetime import datetime
import json
import sys

# Load environment variables from .env file
load_dotenv()

# Get MongoDB URI from environment variables
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["SocialMediaAnalytics"]
surveys_collection = db["surveys_collection"]

def analyze_sentiment(text):
    """
    Analyze sentiment of a text response using TextBlob.
    Returns 'positive', 'negative', or 'neutral'.
    """
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    if polarity > 0:
        return "positive"
    elif polarity < 0:
        return "negative"
    else:
        return "neutral"

def process_survey(survey_id):
    """
    Process a specific survey and generate summary statistics.
    """
    from bson.objectid import ObjectId
    survey = surveys_collection.find_one({"_id": ObjectId(survey_id)})
    
    if not survey:
        print(f"No survey found with ID: {survey_id}", file=sys.stderr)
        return None

    # Initialize lists for summary
    question_responses = []
    sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}

    # Process the survey
    for q in survey["questions"]:
        sentiment = analyze_sentiment(q["response"])
        sentiment_counts[sentiment] += 1
        question_responses.append({
            "surveyId": survey["_id"],
            "userId": survey.get("userId"),
            "postId": survey.get("postId"),
            "question": q["question"],
            "response": q["response"],
            "sentiment": sentiment,
            "submittedAt": survey["submittedAt"]
        })

    # Convert to DataFrame for analysis
    df = pd.DataFrame(question_responses)

    # Generate summary statistics
    total_responses = len(df)
    summary = {
        "totalResponses": total_responses,
        "sentimentDistribution": sentiment_counts,
        "questions": df.groupby("question").agg({
            "response": "count",
            "sentiment": lambda x: x.value_counts().to_dict()
        }).to_dict()
    }

    return summary

def main():
    """
    Main function to run the survey processing.
    """
    try:
        print("Starting survey processing...")
        if len(sys.argv) < 2:
            print("Usage: python process_surveys.py <survey_id>", file=sys.stderr)
            sys.exit(1)

        survey_id = sys.argv[1]
        summary = process_survey(survey_id)
        if summary:
            print(json.dumps(summary))
            print("Survey processing completed.")
        else:
            print(f"Failed to process survey {survey_id}", file=sys.stderr)
            sys.exit(1)

    except Exception as e:
        print(f"Error during survey processing: {str(e)}", file=sys.stderr)
        sys.exit(1)

    finally:
        client.close()

if __name__ == '__main__':
    main()
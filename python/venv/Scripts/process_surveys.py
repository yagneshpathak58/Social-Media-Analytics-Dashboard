# Import required libraries
import pymongo
from pymongo import MongoClient
import pandas as pd
from textblob import TextBlob
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Get MongoDB URI from environment variables
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["SocialMediaAnalytics"]  # Database name
surveys_collection = db["surveys_collection"]   # Surveys collection

def analyze_sentiment(text):
    """
    Analyze sentiment of a text response using TextBlob.
    Returns 'positive', 'negative', or 'neutral'.
    """

    # Create TextBlob object
    blob = TextBlob(text)

    # Get polarity score (-1 to 1)
    polarity = blob.sentiment.polarity

    # Determine sentiment
    if polarity > 0:
        return "positive"
    elif polarity <0:
        return "negative"
    else:
        return "neutral"
    
def process_surveys():
    """
    Process survey responses and generate summary statistics.
    """
    # Fetch all surveys from the surveys collection
    surveys = surveys_collection.find()

    # Convert to list for processing
    surveys_list = list(surveys)

    # If no surveys, exit
    if not surveys_list:
        print("No surveys found to process.")
        return
    
    # Initialize lists for summary
    question_responses = []
    sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}

    # Process each survey
    for survey in surveys_list:
        for q in survey["questions"]:
            # Analyze sentiment of response
            sentiment = analyze_sentiment(q["response"])
            
            # Update sentiment counts
            sentiment_counts[sentiment] += 1
            
            # Store question-response data
            question_responses.append({
                "surveyId": survey["_id"],
                "userId": survey.get("userId"),
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

    # Print summary
    print("Survey Processing Summary:")
    print(f"Total Responses: {total_responses}")
    print(f"Sentiment Distribution: {sentiment_counts}")
    print("\nQuestion-wise Analysis:")
    for question, stats in summary["questions"].items():
        print(f"\nQuestion: {question}")
        print(f"Response Count: {stats['response']}")
        print(f"Sentiment Breakdown: {stats['sentiment']}")

    
    # Optionally, save summary to MongoDB (e.g., in a new collection)
    # db["survey_summaries"].insert_one({
    #     "summary": summary,
    #     "processedAt": datetime.utcnow()
    # })

def main():
    """
    Main function to run the survey processing.
    """

    try:
        print("Starting survey processing...")
        process_surveys()
        print("Survey processing completed.")
    except Exception as e:
        print(f"Error during survey processing: {str(e)}")
    finally:
        # Close MongoDB connection
        client.close()
    
if __name__ == '__main__':
    main()
   
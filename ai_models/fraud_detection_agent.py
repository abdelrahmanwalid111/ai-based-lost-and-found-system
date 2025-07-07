from flask import Flask, jsonify
from pymongo import MongoClient
from sklearn.ensemble import IsolationForest
from nltk.tokenize import word_tokenize
import nltk
import numpy as np
from datetime import datetime, timedelta
import threading
import time
import warnings


warnings.filterwarnings('ignore')
nltk.download('punkt')

app = Flask(__name__)

# MongoDB connection
client = MongoClient("mongodb://100.65.0.126:27017/")
db = client["Lost_Found_new"]
reports_col = db["reports"]
users_col = db["users"]

# ------------------------
# Feature Extraction
# ------------------------

def extract_user_features(user_reports):
    now = datetime.utcnow()
    last_week = now - timedelta(days=7)

    report_dates = [
        r["locationDetails"].get("reportedDate")
        for r in user_reports
        if "locationDetails" in r and "reportedDate" in r
    ]
    report_count_week = sum(
        1 for date in report_dates
        if datetime.strptime(date, "%Y-%m-%d") >= last_week
    )

    avg_description_len = np.mean([
        len(word_tokenize(r["itemDetails"].get("description", "")))
        for r in user_reports
    ]) if user_reports else 0

    descriptions = [r["itemDetails"].get("description", "").strip().lower() for r in user_reports]
    duplicate_text_flag = 1 if len(set(descriptions)) < len(descriptions) else 0
    high_frequency_flag = 1 if report_count_week > 5 else 0

    return {
        "report_frequency": report_count_week,
        "avg_description_length": avg_description_len,
        "duplicate_text_flag": duplicate_text_flag,
        "high_frequency_flag": high_frequency_flag
    }

def generate_fraud_reason(features):
    reasons = []
    if features["high_frequency_flag"]:
        reasons.append("High number of reports in the last 7 days")
    if features["duplicate_text_flag"]:
        reasons.append("Duplicate descriptions across reports")
    if features["avg_description_length"] < 3:
        reasons.append("Very short descriptions")
    return "; ".join(reasons) or "Unusual reporting pattern detected"

# ------------------------
# Detection
# ------------------------

def detect_fraud(feature_list):
    matrix = np.array([
        [
            f["report_frequency"],
            f["avg_description_length"],
            f["duplicate_text_flag"],
            f["high_frequency_flag"]
        ] for f in feature_list
    ])
    model = IsolationForest(contamination=0.2, random_state=42)
    model.fit(matrix)
    return model.predict(matrix)

# ------------------------
# Main Detection Function
# ------------------------

def run_fraud_detection():
    try:
        print("🛡️ Running fraud detection on ALL users...")

        user_ids = reports_col.distinct("userId")
        user_features = []
        valid_user_ids = []

        for uid in user_ids:
            reports = list(reports_col.find({
                "userId": uid,
                "fraud_checked": {"$exists": False}
            }))

            if not reports:
                continue

            features = extract_user_features(reports)
            user_features.append(features)
            valid_user_ids.append(uid)

        if not user_features:
            print("✅ No new reports to check.")
            return

        predictions = detect_fraud(user_features)

        for i, pred in enumerate(predictions):
            uid = valid_user_ids[i]
            features = user_features[i]
            reason = generate_fraud_reason(features)
            is_fraud = bool(pred == -1)

            # Update user's reports
            reports_col.update_many(
                {"userId": uid, "fraud_checked": {"$exists": False}},
                {
                    "$set": {
                        "fraud": is_fraud,
                        "fraud_checked": True,
                        "fraud_reason": reason if is_fraud else ""
                    }
                }
            )

            # Update user profile
            users_col.update_one(
                {"_id": uid},
                {"$set": {"fraudUser": is_fraud}},
                upsert=True
            )

            print(f"{'🚨' if is_fraud else '🔍'} User {uid} flagged as {'FRAUD' if is_fraud else 'CLEAN'} | Reason: {reason if is_fraud else 'N/A'}")

    except Exception as e:
        print(f"❌ Error during fraud detection: {e}")

# ------------------------
# Background Thread
# ------------------------

def periodic_checker():
    while True:
        run_fraud_detection()
        time.sleep(30)

# ------------------------
# Flask Endpoint (Optional)
# ------------------------

@app.route('/run_fraud_detection', methods=['POST'])
def trigger_fraud_check():
    run_fraud_detection()
    return jsonify({"message": "Fraud detection triggered manually"}), 200

# ------------------------
# Start Background Thread
# ------------------------

if __name__ == '__main__':
    threading.Thread(target=periodic_checker, daemon=True).start()
    app.run(host='0.0.0.0', port=5003)

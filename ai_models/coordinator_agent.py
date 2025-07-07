from flask import Flask, jsonify
from bson import ObjectId
from pymongo import MongoClient
from datetime import datetime
import requests
import time
import os

app = Flask(__name__)

# MongoDB setup
client = MongoClient("mongodb://100.65.0.126:27017/")
db = client["Lost_Found_new"]
reports_collection = db["reports"]

# Base paths
BASE_IMAGE_PATH = r"\\DESKTOP-GF89051\uploads"

# Logging helper
def log(message, status="INFO"):
    symbols = {
        "CHECK": "🕐",
        "WAIT": "📥",
        "SEND": "📤",
        "PROCESS": "🔄",
        "DONE": "✅",
        "ERROR": "❌"
    }
    print(f"{symbols.get(status, 'ℹ️')} [Coordinator Agent] {message}")

def serialize(report):
    def convert(value):
        if isinstance(value, ObjectId):
            return str(value)
        elif isinstance(value, datetime):
            return value.isoformat()
        elif isinstance(value, dict):
            return {k: convert(v) for k, v in value.items()}
        elif isinstance(value, list):
            return [convert(v) for v in value]
        return value
    return {k: convert(v) for k, v in report.items()}

def check_service(url, name):
    try:
        res = requests.post(url, json={"lost": [], "found": []}, timeout=5)
        if res.status_code == 200:
            log(f"{name} is online and responding ✅", "DONE")
            return True
        else:
            log(f"{name} responded with status {res.status_code}", "ERROR")
            return False
    except Exception as e:
        log(f"{name} unreachable: {e}", "ERROR")
        return False

def fetch_unmatched_reports():
    log("Fetching unmatched lost and found reports...", "CHECK")
    lost = list(reports_collection.find({
        "reportType": "lost",
        "status": "active",
        "$or": [{"matchedReportIds": {"$exists": False}}, {"matchedReportIds": {"$size": 0}}]
    }))
    found = list(reports_collection.find({
        "reportType": "found",
        "status": "active",
        "$or": [{"matchedReportIds": {"$exists": False}}, {"matchedReportIds": {"$size": 0}}]
    }))
    log(f"Fetched {len(lost)} lost and {len(found)} found", "PROCESS")
    return lost, found

def attach_image_paths(reports, report_type):
    folder = os.path.join(BASE_IMAGE_PATH, report_type.capitalize())
    try:
        files = os.listdir(folder)
        existing = {os.path.splitext(f)[0].lower(): f for f in files}
    except Exception as e:
        log(f"❌ Cannot access folder {folder}: {e}", "ERROR")
        existing = {}

    for report in reports:
        filenames = report.get("itemDetails", {}).get("images", [])
        paths = []
        for filename in filenames:
            base = os.path.splitext(os.path.basename(filename))[0].lower()
            match = existing.get(base)
            if match:
                path = os.path.normpath(os.path.join(folder, match))
                if os.path.isfile(path):
                    paths.append(path)
                else:
                    log(f"File listed but not on disk: {path}", "ERROR")
            else:
                log(f"File not found for base name: {base}", "ERROR")
        report["image_paths"] = paths

def send_to_text_matching_agent(lost_reports, found_report):
    log(f"Sending Found[{found_report['_id']}] to Text Matching Agent...", "SEND")
    try:
        res = requests.post("http://localhost:5001/match-text", json={
            "lost": [serialize(l) for l in lost_reports],
            "found": [serialize(found_report)]
        })
        if res.status_code == 200:
            matches = res.json().get("matches", [])
            log(f"Text Matches: {matches}", "PROCESS")
            return matches
        else:
            log(f"Text Agent error: {res.status_code}", "ERROR")
    except Exception as e:
        log(f"Text Agent unreachable: {e}", "ERROR")
    return []

def send_to_image_matching_agent(lost_reports, found_report):
    log(f"Sending Found[{found_report['_id']}] to Image Matching Agent...", "SEND")
    try:
        attach_image_paths([found_report], "found")
        attach_image_paths(lost_reports, "lost")

        res = requests.post("http://localhost:5002/match-image", json={
            "lost": [serialize(l) for l in lost_reports],
            "found": [serialize(found_report)]
        })
        if res.status_code == 200:
            matches = res.json().get("matches", [])
            log(f"Image Matches: {matches}", "PROCESS")
            return matches
        else:
            log(f"Image Agent error: {res.status_code}", "ERROR")
    except Exception as e:
        log(f"Image Agent unreachable: {e}", "ERROR")
    return []

def merge_and_average_matches(text_matches, image_matches):
    log("Merging and averaging match scores...", "PROCESS")
    merged = {}
    for match in text_matches + image_matches:
        key = (match["lost_id"], match["found_id"])
        if key not in merged:
            merged[key] = {
                "lost_id": match["lost_id"],
                "found_id": match["found_id"],
                "scores": [match["score"]],
                "matched_on": match.get("matched_on", datetime.now().isoformat())
            }
        else:
            merged[key]["scores"].append(match["score"])
    return [{
        "lost_id": val["lost_id"],
        "found_id": val["found_id"],
        "score": sum(val["scores"]) / len(val["scores"]),
        "matched_on": val["matched_on"]
    } for val in merged.values()]

def update_report_matches(matches):
    log(f"Updating {len(matches)} match(es) in database...", "PROCESS")
    for match in matches:
        lost_id = match["lost_id"]
        found_id = match["found_id"]
        score = match["score"]
        matched_on = match["matched_on"]

        try:
            log(f"Updating: Lost[{lost_id}] ↔ Found[{found_id}] (Score: {score:.2f})", "PROCESS")

            found_result = reports_collection.update_one(
                {"_id": ObjectId(found_id)},
                {
                    "$set": {"status": "matched"},
                    "$addToSet": {
                        "matchedReportIds": lost_id,
                        "matchDetails": {
                            "report_id": lost_id,
                            "score": score,
                            "matched_on": matched_on
                        }
                    }
                }
            )

            lost_result = reports_collection.update_one(
                {"_id": ObjectId(lost_id)},
                {
                    "$set": {"status": "matched"},
                    "$addToSet": {
                        "matchedReportIds": found_id,
                        "matchDetails": {
                            "report_id": found_id,
                            "score": score,
                            "matched_on": matched_on
                        }
                    }
                }
            )

        except Exception as e:
            log(f"❌ Failed to update reports: {e}", "ERROR")

    log("✅ Database update complete.", "DONE")

def coordinator_loop():
    log("Coordinator Agent starting...", "CHECK")

    try:
        client.server_info()
        log("Connected to MongoDB", "DONE")
    except Exception as e:
        log(f"MongoDB connection failed: {e}", "ERROR")
        return

    text_ready = check_service("http://localhost:5001/match-text", "Text Matching Agent")
    image_ready = check_service("http://localhost:5002/match-image", "Image Matching Agent")

    if not (text_ready and image_ready):
        log("One or more agents unavailable. Exiting...", "ERROR")
        return

    while True:
        log("Checking for unmatched reports...", "WAIT")
        lost_reports, found_reports = fetch_unmatched_reports()

        if not lost_reports or not found_reports:
            log("No unmatched reports. Sleeping 30 seconds...", "WAIT")
            time.sleep(30)
            continue

        for found in found_reports:
            text_matches = send_to_text_matching_agent(lost_reports, found)
            image_matches = send_to_image_matching_agent(lost_reports, found)

            merged_matches = merge_and_average_matches(text_matches, image_matches)

            if merged_matches:
                update_report_matches(merged_matches)
            else:
                log(f"No match found for Found[{found['_id']}]", "PROCESS")

        log("Cycle complete. Sleeping 30 seconds...\n", "WAIT")
        time.sleep(30)

if __name__ == "__main__":
    coordinator_loop()

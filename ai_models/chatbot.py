# lost_found_chatbot.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import jwt
import os
import base64
import uuid

# ========== Configuration ==========
app = Flask(__name__)
CORS(app)

SECRET_KEY = "mysecretkey"
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://100.65.0.126:27017/Lost_Found_new")

# ========== Database Setup ==========
client = MongoClient(MONGO_URI)
db = client.get_database()
reports_col = db["reports"]
users_col = db["users"]

# ========== In-Memory User Session ==========
user_memory = {}

# ========== Static Content ==========

FAQS = {
    "how to report": "To report a lost or found item, just tell me what happened and I’ll guide you step-by-step.",
    "how matching works": "We match lost and found items based on details like description, images, location, and time.",
    "contact support": "You can contact our support via email or inside the app under 'Help'."
}

TERMS = "By using this app, you agree to our policy that all reports must be truthful. Fake reports may be flagged."


CATEGORY_TREE = {
    "Electronics": {
        "Phones": ["iPhone", "Android", "Flip Phone", "Smartphone"],
        "Computers": ["Laptop", "Desktop", "Tablet", "Chromebook"],
        "Audio": ["Headphones", "Earbuds", "Speakers", "Microphone"],
        "Cameras": ["DSLR", "Mirrorless", "Point-and-Shoot", "Action Cam"],
        "Gaming": ["Console", "Controller", "VR Headset", "Game Disc"],
        "cancel":["cancel"]

    },
    "Clothing": {
        "Men's": ["Shirt", "Pants", "Jacket", "Shoes", "Suit"],
        "Women's": ["Dress", "Blouse", "Skirt", "Heels", "Handbag"],
        "Unisex": ["T-Shirt", "Jeans", "Hoodie", "Sneakers", "Cap"],
        "cancel":["cancel"]
    },
    "Documents": {
        "Personal ID": ["Passport", "Driver's License", "National ID", "Student ID"],
        "Financial": ["Credit Card", "Debit Card", "Checkbook", "Bank Statement"],
        "Academic": ["Diploma", "Transcript", "Textbook", "Notebook"],
        "Travel": ["Boarding Pass", "Visa", "Hotel Reservation", "Travel Insurance"],
        "cancel":["cancel"]
    },
    "Accessories": {
        "Jewelry": ["Necklace", "Ring", "Bracelet", "Earrings", "Watch"],
        "Bags": ["Backpack", "Purse", "Briefcase", "Wallet", "Luggage"],
        "Tech": ["Smartwatch", "Fitness Tracker", "Phone Case", "Charger"],
        "Misc": ["Glasses", "Umbrella", "Keychain", "Scarf"],
        "cancel": ["cancel"]
    },
    "Personal Items": {
        "Health": ["Medication", "Glasses", "Hearing Aid", "CPAP Machine"],
        "Kids": ["Pacifier", "Baby Bottle", "Diaper Bag", "Toy"],
        "Pet": ["Collar", "Leash", "ID Tag", "Carrier"],
        "cancel": ["cancel"]
    },
    "cancel":{"cancel"
    }
}

# ========== Helper Functions ==========
def get_current_user():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    try:
        token = auth_header.split(" ")[1]
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = decoded.get("userId")
        return users_col.find_one({"_id": ObjectId(user_id)}) if user_id else None
    except:
        return None

def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except:
        return None

# ========== Chatbot Logic ==========
def handle_reporting(user_id, msg, context, lat=None, lng=None):
    step = context.get("step", 0)
    data = context.get("data", {})
    report_type = context.get("type").replace("report_","")
    user_input = msg.strip()

    steps = [
        ("Choose a category:", "category"),
        ("Choose a subcategory:", "subCategory"),
        ("Select item type:", "itemType"),
        ("Title or name of the item?", "title"),
        ("Brief description?", "description"),
        ("Primary color?", "primaryColor"),
        ("Secondary color? (or 'none')", "secondaryColor"),
        ("City", "city"),
        ("Area", "area"),
        ("Date (YYYY-MM-DD)", "lostDate_text"),
        ("Upload or take a photo, or press 'Skip' to continue without one.", "photo"),
        ("Reviewing your report. Type 'Yes' to confirm or 'Cancel'.", "confirm")
    ]

    key = steps[step][1]

    if key == "category":
        if user_input not in CATEGORY_TREE:
            return {"reply": steps[step][0], "context": context, "quick_replies": list(CATEGORY_TREE)}
        data[key] = user_input
        return {"reply": steps[step+1][0], "context": {"type": context["type"], "step": step+1, "data": data}, "quick_replies": list(CATEGORY_TREE[user_input])}

    if key == "subCategory":
        if user_input not in CATEGORY_TREE.get(data.get("category"), {}):
            return {"reply": steps[step][0], "context": context, "quick_replies": list(CATEGORY_TREE.get(data.get("category"), {}))}
        data[key] = user_input
        return {"reply": steps[step+1][0], "context": {"type": context["type"], "step": step+1, "data": data}, "quick_replies": CATEGORY_TREE[data["category"]][user_input]}

    if key == "itemType":
        valid = CATEGORY_TREE.get(data.get("category", ""), {}).get(data.get("subCategory", ""), [])
        if user_input not in valid:
            return {"reply": steps[step][0], "context": context, "quick_replies": valid}
        data[key] = user_input
        return {"reply": steps[step+1][0], "context": {"type": context["type"], "step": step+1, "data": data}}

    if key == "photo":
        # If no input yet or invalid input for photo, show quick replies
        if not user_input or not (user_input.lower() == "skip" or user_input.startswith("data:image/")):
            return {
                "reply": steps[step][0],
                "context": context,
                "quick_replies": ["Upload photo", "Take a photo", "Skip"]
            }

        if user_input.lower() == "skip":
            data["photo"] = None
            # If skipped, move to confirmation
            return {
                "reply": steps[step + 1][0],
                "context": {"type": context["type"], "step": step + 1, "data": data},
                "quick_replies": ["Yes", "Cancel"]
            }
        elif user_input.startswith("data:image/"):
            try:
                base64_data = user_input.split(",", 1)[1]
                image_bytes = base64.b64decode(base64_data)
                ext = user_input.split(";")[0].split("/")[1]
                filename = f"{uuid.uuid4().hex}.{ext}"
                report_folder = "Found" if report_type == "found" else "Lost"
                folder_path = f"uploads/{report_folder}"
                os.makedirs(folder_path, exist_ok=True)
                filepath = f"{folder_path}/{filename}"

                with open(filepath, "wb") as f:
                    f.write(image_bytes)

                data["photo"] = f"/{filepath}"
                # If image successfully processed, move to confirmation
                return {
                    "reply": steps[step + 1][0],
                    "context": {"type": context["type"], "step": step + 1, "data": data},
                    "quick_replies": ["Yes", "Cancel"]
                }
            except Exception:
                # If image processing fails, prompt again with the photo quick replies
                return {
                    "reply": "Failed to process image. Please try again or skip.",
                    "context": context,  # Stay on the same step
                    "quick_replies": ["Upload photo", "Take a photo", "Skip"]
                }
        else:
            # This part should ideally be covered by the initial check for user_input
            # but as a fallback, prompt again with quick replies.
            return {
                "reply": "Please upload a valid photo (base64) or type 'Skip'.",
                "context": context,  # Stay on the same step
                "quick_replies": ["Upload photo", "Take a photo", "Skip"]
            }





    elif key == "secondaryColor":
        data[key] = None if user_input.lower() == "none" else user_input
    elif key == "lostDate_text":
        parsed = parse_date(user_input)
        if not parsed:
            return {"reply": "Invalid date format. Please use YYYY-MM-DD.", "context": context}
        data["lostDate"] = parsed
    elif key == "confirm":
        if user_input.lower() != "yes":
            return {"reply": "Report not submitted. You can type 'Cancel' to exit.", "context": context}
        report = {
            "userId": str(user_id),
            "reportType": report_type,
            "itemDetails": {
                "title": data.get("title"),
                "description": data.get("description"),
                "category": data.get("category"),
                "subCategory": data.get("subCategory"),
                "itemType": data.get("itemType"),
                "primaryColor": data.get("primaryColor"),
                "secondaryColor": data.get("secondaryColor"),
                "images": [data["photo"]] if data.get("photo") else []
            },
            "locationDetails": {
                "lastSeenLocation": {
                    "lat": lat or 0.0,
                    "lng": lng or 0.0,
                    "city": data.get("city"),
                    "area": data.get("area")
                },
                "lostDate": data.get("lostDate"),
            },
            "status": "active",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "__v": 0,
        }
        result = reports_col.insert_one(report)
        reports_col.update_one({"_id": result.inserted_id}, {"$set": {"id": str(result.inserted_id)}})
        return {"reply": "Thanks! Your report has been submitted successfully.", "context": {}}
    else:
        data[key] = user_input

    return {"reply": steps[step+1][0], "context": {"type": context["type"], "step": step+1, "data": data}}

# ========== API Route ==========
@app.route("/chat", methods=["POST"])
def chat():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    user_id = str(user["_id"])
    name = user.get("name", "there")
    msg = (request.json or {}).get("message", "").strip()
    lat = request.json.get("lat")
    lng = request.json.get("lng")

    context = user_memory.get(user_id, {})

    if msg.lower() == "cancel":
        user_memory[user_id] = {}
        return jsonify({
            "reply": "Okay, cancelled. What would you like to do next?",
            "quick_replies": ["Report Lost Item", "Report Found Item", "Show Reports Status", "Show Terms", "Show FAQs"]
        })

    if context.get("type") in ["report_lost", "report_found"]:
        result = handle_reporting(user_id, msg, context, lat, lng)
        user_memory[user_id] = result.get("context", {})
        return jsonify({
            "reply": result["reply"],
            "quick_replies": result.get("quick_replies", [])
        })

    if msg.lower() == "report lost item":
        context = {"type": "report_lost", "step": 0, "data": {}}
        result = handle_reporting(user_id, "", context, lat, lng)
        user_memory[user_id] = result.get("context", {})
        return jsonify({
            "reply": result["reply"],
            "quick_replies": result.get("quick_replies", [])
        })

    if msg.lower() == "report found item":
        context = {"type": "report_found", "step": 0, "data": {}}
        result = handle_reporting(user_id, "", context, lat, lng)
        user_memory[user_id] = result.get("context", {})
        return jsonify({
            "reply": result["reply"],
            "quick_replies": result.get("quick_replies", [])
        })


    if context.get("type") == "viewing_reports":
        selected_title = msg.strip()
        report_id = context.get("report_map", {}).get(selected_title)
        if report_id:
            report = reports_col.find_one({"_id": ObjectId(report_id)})
            if report:
                user_memory[user_id] = {}  # Clear context
                return jsonify({
                    "reply": f"*Title: {report['itemDetails'].get('title')}\n*Status: {report.get('status', 'unknown')}",
                    "quick_replies": ["Report Lost Item", "Report Found Item", "Show Reports Status", "Show Terms", "Show FAQs"]
                })
        return jsonify({
            "reply": "Invalid selection. Please choose a valid report or type 'Cancel'.",
            "quick_replies": list(context.get("report_map", {}).keys()) + ["Cancel"]
        })




    if msg.lower() == "show reports status":
        user_reports = list(reports_col.find({"userId": user_id}))
        if not user_reports:
            return jsonify({
                "reply": "You have no reports yet.",
                "quick_replies": ["Report Lost Item", "Report Found Item", "Show Terms", "Show FAQs"]
            })

        titles = [f"{r['itemDetails'].get('title', 'Untitled')} (ID: {r.get('id', str(r['_id']))})" for r in
                  user_reports]
        user_memory[user_id] = {"type": "viewing_reports",
                                "report_map": {f"{r['itemDetails'].get('title', 'Untitled')}": str(r['_id']) for r in
                                               user_reports}}

        return jsonify({
            "reply": "Here are your reports. Select one to view its status:",
            "quick_replies": list(user_memory[user_id]["report_map"].keys()) + ["Cancel"]
        })

    if msg.lower() == "show terms":
        return jsonify({"reply": TERMS,
            "quick_replies": [
                "Report Lost Item", "Report Found Item", "Show Reports Status", "Show Terms", "Show FAQs"
            ]})

    if msg.lower() in ["faqs", "show faqs"]:
        faq_msg = "\n".join([f"- {k}: {v}" for k, v in FAQS.items()])
        return jsonify({
            "reply": faq_msg,
            "quick_replies": [
                "Report Lost Item", "Report Found Item", "Show Reports Status", "Show Terms", "Show FAQs"
            ]
        })


    return jsonify({"reply": "What else can I help you with?",
        "quick_replies": ["Report Lost Item", "Report Found Item", "Show Reports Status", "Show Terms", "Show FAQs"
                        ] })


# ========== Run App ==========
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
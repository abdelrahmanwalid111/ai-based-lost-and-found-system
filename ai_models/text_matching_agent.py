from flask import Flask, request, jsonify
import nltk
import numpy as np
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from langdetect import detect
from datetime import datetime
import traceback
from sentence_transformers import SentenceTransformer, util

nltk.download('punkt')
nltk.download('stopwords')

app = Flask(__name__)

STOPWORDS = {
    'en': set(stopwords.words('english')),
    'ar': set(stopwords.words('arabic'))
}

# Load SBERT model
model = SentenceTransformer('all-MiniLM-L6-v2')  # Lightweight and fast

def log(message, status="INFO"):
    symbols = {
        "INFO": "🧠",
        "ERROR": "❌",
        "SUCCESS": "✅",
        "STEP": "🔄",
        "COMPARE": "📏",
        "RECEIVE": "📥"
    }
    print(f"{symbols.get(status, 'ℹ️')} [Text Matching Agent] {message}")

def detect_language(text):
    try:
        return detect(text)
    except:
        return 'en'

def preprocess(text):
    lang = detect_language(text)
    tokens = word_tokenize(text.lower())
    tokens = [word for word in tokens if word.isalnum()]
    stop_words = STOPWORDS.get(lang, set())
    filtered_tokens = [word for word in tokens if word not in stop_words]
    return ' '.join(filtered_tokens)

def compute_similarity(text1, text2):
    embeddings = model.encode([text1, text2], convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(embeddings[0], embeddings[1]).item()
    return similarity

def match_reports(lost_reports, found_reports, threshold=0.6):
    log("🚀 Starting text matching process...", "STEP")
    matches = []
    for lost in lost_reports:
        try:
            lost_id = lost.get('_id')
            lost_text_raw = lost['itemDetails'].get('title', '') + ' ' + lost['itemDetails'].get('description', '')
            lost_text = preprocess(lost_text_raw)

            log(f"📥 Processing Lost Report [{lost_id}]")
            log(f"🔍 Preprocessed Lost Text: {lost_text}", "INFO")

            for found in found_reports:
                found_id = found.get('_id')
                found_text_raw = found['itemDetails'].get('title', '') + ' ' + found['itemDetails'].get('description', '')
                found_text = preprocess(found_text_raw)

                log(f"📥 Comparing with Found Report [{found_id}]", "INFO")
                log(f"🔍 Preprocessed Found Text: {found_text}", "INFO")

                score = compute_similarity(lost_text, found_text)
                log(f"📏 Similarity Score (Lost[{lost_id}] vs Found[{found_id}]): {score:.2f}", "COMPARE")

                if score >= threshold:
                    match_entry = {
                        'lost_id': str(lost_id),
                        'found_id': str(found_id),
                        'score': round(score, 3),
                        'matched_on': datetime.now().isoformat()
                    }
                    matches.append(match_entry)
                    log(f"✅ Match Found: {match_entry}", "SUCCESS")

        except Exception as e:
            log(f"❌ Error comparing Lost[{lost.get('_id')}] with found reports: {e}", "ERROR")
            traceback.print_exc()

    log("✅ Text matching completed.", "SUCCESS")
    return matches

@app.route('/match-text', methods=['POST'])
def match_text():
    try:
        data = request.get_json()
        lost = data.get('lost', [])
        found = data.get('found', [])
        log(f"📥 Received {len(lost)} lost and {len(found)} found reports for matching", "RECEIVE")
        matches = match_reports(lost, found)
        return jsonify({'matches': matches}), 200
    except Exception as e:
        log(f"❌ Critical failure: {e}", "ERROR")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    log("🔁 Text Matching Agent is listening on port 5001...", "INFO")
    app.run(port=5001)

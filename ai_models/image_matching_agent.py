from flask import Flask, request, jsonify
from PIL import Image
from datetime import datetime
from torchvision import models, transforms
import torch
import numpy as np
import os

app = Flask(__name__)

# Logging utility
def log(message):
    print(f"🧠 [Image Matching Agent] {message}")

# Load pretrained ResNet-18 as a feature extractor
def get_feature_extractor():
    model = models.resnet18(pretrained=True)
    model = torch.nn.Sequential(*(list(model.children())[:-1]))  # remove classification head
    model.eval()
    return model

# Preprocess image for model input
def preprocess_image(image_path):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor()
    ])
    try:
        image = Image.open(image_path).convert('RGB')
        return transform(image).unsqueeze(0)
    except Exception as e:
        log(f"❌ Error processing image {image_path}: {e}")
        return None

# Extract image feature vector
def extract_features(image_path, model):
    if not os.path.isfile(image_path):
        log(f"❌ File does not exist: {image_path}")
        return None
    image_tensor = preprocess_image(image_path)
    if image_tensor is None:
        return None
    with torch.no_grad():
        features = model(image_tensor)
    return features.squeeze().numpy()

# Cosine similarity for feature vectors
def cosine_similarity(vec1, vec2):
    if vec1 is None or vec2 is None:
        return 0.0
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

# Matching logic
def match_images(lost_reports, found_reports, model, threshold=0.85):
    log("🚀 Starting image matching process...")
    matches = []
    for lost in lost_reports:
        lost_imgs = lost.get('image_paths', [])
        for found in found_reports:
            found_imgs = found.get('image_paths', [])
            for lost_img in lost_imgs:
                for found_img in found_imgs:
                    log(f"📷 Comparing Lost[{lost['_id']}] with Found[{found['_id']}]")
                    lost_vec = extract_features(lost_img, model)
                    found_vec = extract_features(found_img, model)
                    score = cosine_similarity(lost_vec, found_vec)
                    log(f"📏 Similarity score: {score:.2f}")
                    if score >= threshold:
                        match_entry = {
                            'lost_id': str(lost['_id']),
                            'found_id': str(found['_id']),
                            'score': round(float(score), 4),
                            'matched_on': datetime.now().isoformat()
                        }
                        matches.append(match_entry)
                        log(f"✅ Image match found: {match_entry}")
    log("✅ Image matching completed.")
    return matches

# API endpoint
@app.route('/match-image', methods=['POST'])
def match_image():
    data = request.get_json()
    lost = data.get('lost', [])
    found = data.get('found', [])
    model = get_feature_extractor()
    matches = match_images(lost, found, model)
    return jsonify({'matches': matches}), 200

# Run agent
if __name__ == '__main__':
    log("🔁 Image Matching Agent is listening on port 5002...")
    app.run(port=5002)

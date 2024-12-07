import cv2
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1
from pymongo import MongoClient
import numpy as np
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Initialize MTCNN for face detection
device = 'cuda' if torch.cuda.is_available() else 'cpu'
mtcnn = MTCNN(keep_all=True, device=device)

# Initialize FaceNet for feature extraction
facenet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/')
db = client['face_recognition']
collection = db['faces']

def extract_embedding(face):
    face = cv2.resize(face, (160, 160))
    face_tensor = torch.tensor(face).permute(2, 0, 1).unsqueeze(0).float() / 255.0
    face_tensor = face_tensor.to(device)
    with torch.no_grad():
        embedding = facenet(face_tensor).cpu().numpy().squeeze()
    return embedding

@app.route('/api/register', methods=['POST'])
def register_face():
    try:
        data = request.json
        image_data = base64.b64decode(data['image'].split(',')[1])
        name = data['name']
        
        # Convert image data to numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Detect faces
        boxes, _ = mtcnn.detect(frame)
        if boxes is None:
            return jsonify({'error': 'No face detected'}), 400
            
        x1, y1, x2, y2 = [int(b) for b in boxes[0]]
        face = frame[y1:y2, x1:x2]
        face_embedding = extract_embedding(face)
        
        # Save to database
        collection.insert_one({'name': name, 'embedding': face_embedding.tolist()})
        return jsonify({'message': f'Face registered for {name}'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recognize', methods=['POST'])
def recognize_face():
    try:
        data = request.json
        image_data = base64.b64decode(data['image'].split(',')[1])
        
        # Convert image data to numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Detect faces
        boxes, _ = mtcnn.detect(frame)
        if boxes is None:
            return jsonify({'error': 'No face detected'}), 400
            
        results = []
        for box in boxes:
            x1, y1, x2, y2 = [int(b) for b in box]
            face = frame[y1:y2, x1:x2]
            face_embedding = extract_embedding(face)
            
            # Find closest match
            min_distance = float('inf')
            match_name = None
            
            for record in collection.find():
                db_embedding = np.array(record['embedding'])
                distance = np.linalg.norm(face_embedding - db_embedding)
                if distance < min_distance:
                    min_distance = distance
                    match_name = record['name']
            
            if min_distance < 0.6:  # Threshold for recognition
                results.append({
                    'name': match_name,
                    'confidence': float(1 - min_distance)
                })
            else:
                results.append({
                    'name': 'Unknown',
                    'confidence': 0.0
                })
                
        return jsonify({'results': results}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)

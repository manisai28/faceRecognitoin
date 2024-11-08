import cv2
import os
import sys
from pymongo import MongoClient
import base64
import json

def capture_photos(name, num_photos=5):
    try:
        # Connect to MongoDB
        client = MongoClient('mongodb://localhost:27017/')
        db = client['face_recognition']
        photos_collection = db['photos']
        
        # Initialize camera
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print(json.dumps({"error": "Failed to open camera"}))
            return False
        
        # Create face detector
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        if face_cascade.empty():
            print(json.dumps({"error": "Failed to load face cascade classifier"}))
            return False
        
        photos_captured = 0
        print(json.dumps({"message": "Starting photo capture. Press 's' to capture photo, 'q' to quit"}))
        
        while photos_captured < num_photos:
            ret, frame = cap.read()
            if not ret:
                continue
                
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)
            
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
                
            cv2.imshow('Capture Photos', frame)
            cv2.setWindowProperty('Capture Photos', cv2.WND_PROP_TOPMOST, 1)
            
            key = cv2.waitKey(1)
            if key == ord('s'):  # Press 's' to save photo
                if len(faces) == 0:
                    print(json.dumps({"warning": "No face detected in frame"}))
                    continue
                
                # Convert image to base64 for MongoDB storage
                _, buffer = cv2.imencode('.jpg', frame)
                img_base64 = base64.b64encode(buffer).decode('utf-8')
                
                # Save to MongoDB
                photo_data = {
                    'name': name,
                    'image': img_base64,
                    'photo_number': photos_captured + 1
                }
                photos_collection.insert_one(photo_data)
                
                photos_captured += 1
                print(json.dumps({"message": f"Photo {photos_captured} of {num_photos} captured"}))
                
            elif key == ord('q'):  # Press 'q' to quit
                break
        
        cap.release()
        cv2.destroyAllWindows()
        client.close()
        
        if photos_captured == num_photos:
            print(json.dumps({"success": True, "message": f"Successfully captured {photos_captured} photos"}))
            return True
        else:
            print(json.dumps({"success": False, "message": f"Capture incomplete. Only got {photos_captured} photos"}))
            return False
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Please provide name as argument"}))
        sys.exit(1)
    
    name = sys.argv[1]
    capture_photos(name)
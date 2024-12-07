import cv2
import torch
from ultralytics import YOLO
import json
import sys
import numpy as np

def detect_crowd(image_path):
    try:
        # Initialize YOLO model
        model = YOLO("yolov8n.pt")
        detection_threshold = 0.4

        # Read image
        image = cv2.imread(image_path)
        if image is None:
            return json.dumps({"error": "Could not read image file"})

        # Convert to RGB
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Perform detection
        results = model(rgb_image)
        
        detected_faces = []
        for result in results:
            for box, conf, cls in zip(result.boxes.xyxy, result.boxes.conf, result.boxes.cls):
                if conf >= detection_threshold and int(cls) == 0:  # Class 0 is 'person'
                    x1, y1, x2, y2 = map(float, box.tolist())  # Convert to float for JSON serialization
                    detected_faces.append({
                        "x": int(x1),
                        "y": int(y1),
                        "width": int(x2 - x1),
                        "height": int(y2 - y1),
                        "confidence": float(conf)
                    })

        response = {
            "count": len(detected_faces),
            "detections": detected_faces
        }
        
        print(json.dumps(response))
        return
    except Exception as e:
        error_response = {
            "error": str(e)
        }
        print(json.dumps(error_response))
        return

if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        detect_crowd(image_path)

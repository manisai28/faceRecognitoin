import tensorflow as tf
import cv2
import numpy as np
import sys
import os
from pathlib import Path

def load_model_and_classes():
    """Load the model and class names with proper error handling"""
    try:
        # Get the directory where the script is located
        script_dir = Path(__file__).parent.absolute()
        
        # Construct full paths to model and class names files
        model_path = os.path.join(script_dir, 'face_recognition_model.h5')
        class_names_path = os.path.join(script_dir, 'class_names.npy')
        
        # Check if files exist
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}")
        if not os.path.exists(class_names_path):
            raise FileNotFoundError(f"Class names file not found at: {class_names_path}")
        
        # Load model and class names
        print("Loading model and class names...")
        model = tf.keras.models.load_model(model_path)
        class_names = np.load(class_names_path, allow_pickle=True)
        
        return model, class_names
    
    except Exception as e:
        print(f"Error loading model and class names: {e}")
        raise

def initialize_camera():
    """Initialize the camera with error handling"""
    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            raise RuntimeError("Failed to open camera")
        return cap
    except Exception as e:
        print(f"Error initializing camera: {e}")
        raise

def recognize_face():
    try:
        # Load model and class names
        model, class_names = load_model_and_classes()
        
        # Initialize camera
        cap = initialize_camera()
        
        # Load face cascade
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        if face_cascade.empty():
            raise RuntimeError("Failed to load face cascade classifier")
        
        # Define confidence threshold for unknown person
        CONFIDENCE_THRESHOLD = 0.5  # Adjust this value based on your needs
        
        print("Starting face recognition...")
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame")
                continue
                
            try:
                # Convert to grayscale
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = face_cascade.detectMultiScale(gray, 1.3, 5)
                
                for (x, y, w, h) in faces:
                    # Extract and preprocess face
                    face = frame[y:y+h, x:x+w]
                    face = cv2.resize(face, (128, 128))
                    face = np.expand_dims(face, axis=0) / 255.0
                    
                    # Make prediction
                    prediction = model.predict(face, verbose=0)
                    predicted_class = np.argmax(prediction)
                    confidence = prediction[0][predicted_class]
                    
                    # Determine if the face is known or unknown
                    if confidence >= CONFIDENCE_THRESHOLD:
                        name = class_names[predicted_class]
                        color = (255, 0, 0)  # Blue for known faces
                    else:
                        name = "Unknown Person"
                        color = (0, 0, 255)  # Red for unknown faces
                    
                    # Draw rectangle and name
                    cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
                    cv2.putText(frame, f"{name} ({confidence:.2f})", 
                               (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, 
                               color, 2)
            
            except Exception as e:
                print(f"Error processing frame: {e}")
                continue
            
            cv2.imshow('Face Recognition', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
    except Exception as e:
        print(f"Fatal error in face recognition: {e}")
        raise
        
    finally:
        if 'cap' in locals():
            cap.release()
        cv2.destroyAllWindows()
        print("Face recognition stopped")

if __name__ == "__main__":
    try:
        # Set TensorFlow logging level to reduce unnecessary messages
        tf.get_logger().setLevel('ERROR')
        
        # Disable oneDNN custom operations message
        os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
        
        recognize_face()
    except KeyboardInterrupt:
        print("\nProgram terminated by user")
    except Exception as e:
        print(f"Program failed: {e}")
        sys.exit(1)
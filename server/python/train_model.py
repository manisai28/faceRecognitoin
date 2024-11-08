import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np
from pymongo import MongoClient
import cv2
import base64
import io
from PIL import Image

def load_data_from_mongodb():
    # Connect to MongoDB
    client = MongoClient('mongodb://localhost:27017/')
    db = client['face_recognition']
    photos_collection = db['photos']
    
    X = []
    y = []
    names = []
    
    # Get all unique names
    unique_names = photos_collection.distinct('name')
    name_to_label = {name: i for i, name in enumerate(unique_names)}
    
    for photo in photos_collection.find():
        # Convert base64 to image
        img_data = base64.b64decode(photo['image'])
        img = Image.open(io.BytesIO(img_data))
        img = img.convert('RGB')
        img = img.resize((128, 128))
        img_array = np.array(img) / 255.0
        
        X.append(img_array)
        y.append(name_to_label[photo['name']])
        names.append(photo['name'])
    
    client.close()
    return np.array(X), np.array(y), unique_names

def create_model(num_classes):
    model = models.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(128, 128, 3)),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.Flatten(),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    return model

def train_model():
    # Load data
    X, y, unique_names = load_data_from_mongodb()
    
    # Create and compile model
    model = create_model(len(unique_names))
    model.compile(optimizer='adam',
                 loss='sparse_categorical_crossentropy',
                 metrics=['accuracy'])
    
    # Train model
    model.fit(X, y, epochs=10, validation_split=0.2)
    
    # Save model
    model.save('face_recognition_model.h5')
    
    # Save class names
    np.save('class_names.npy', unique_names)
    
    return "Model trained successfully"

if __name__ == "__main__":
    train_model()
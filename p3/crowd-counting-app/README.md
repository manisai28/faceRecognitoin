# Crowd Counting Application

A web-based crowd counting system built with the MERN stack and YOLO object detection.

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- MongoDB

## Python Dependencies

```bash
pip install opencv-python torch ultralytics
```

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
npm install
```

2. Create an 'uploads' directory in the server folder:
```bash
mkdir uploads
```

3. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
npm install
```

2. Start the React development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Features

- Upload images through drag-and-drop or file selection
- Real-time crowd detection using YOLO
- Visual display of detected persons with bounding boxes
- Count of detected persons in the image
- Modern, responsive UI built with React and Bootstrap

## Architecture

- Frontend: React.js with React Bootstrap for UI components
- Backend: Node.js with Express
- ML Processing: Python with YOLO (YOLOv8)
- File Upload: Multer middleware
- Python Integration: python-shell for Node.js-Python communication

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false,
    onDrop
  });

  const handleSubmit = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5000/api/detect', formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while processing the image');
    } finally {
      setLoading(false);
    }
  };

  const drawDetections = () => {
    if (!preview || !result?.detections) return preview;

    const img = new Image();
    img.src = preview;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 3;
      
      result.detections.forEach(detection => {
        ctx.strokeRect(detection.x, detection.y, detection.width, detection.height);
      });
    };
    
    return canvas.toDataURL();
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header as="h5" className="text-center">
              Crowd Counting System
            </Card.Header>
            <Card.Body>
              <div
                {...getRootProps()}
                className="border rounded p-4 text-center mb-3"
                style={{ cursor: 'pointer' }}
              >
                <input {...getInputProps()} />
                <p>Drag & drop an image here, or click to select one</p>
              </div>

              {preview && (
                <div className="text-center mb-3">
                  <img
                    src={result ? drawDetections() : preview}
                    alt="Preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              )}

              {error && <Alert variant="danger">{error}</Alert>}

              {result && (
                <Alert variant="success">
                  Detected {result.count} people in the image
                </Alert>
              )}

              <button
                className="btn btn-primary w-100"
                onClick={handleSubmit}
                disabled={!image || loading}
              >
                {loading ? 'Processing...' : 'Detect Crowd'}
              </button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;

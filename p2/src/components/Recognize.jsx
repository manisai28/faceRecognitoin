import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button, Box, Typography, Paper } from '@mui/material';
import axios from 'axios';

const Recognize = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);

  const recognize = async () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const response = await axios.post('http://localhost:5000/api/recognize', {
        image: imageSrc
      });
      setResults(response.data.results);
      setError('');
    } catch (error) {
      setError(error.response?.data?.error || 'Error during recognition');
      setResults([]);
    }
  };

  const startRecognition = useCallback(() => {
    intervalRef.current = setInterval(recognize, 1000);
  }, []);

  const stopRecognition = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Face Recognition
        </Typography>

        <Box sx={{ my: 2 }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            onClick={startRecognition}
            fullWidth
          >
            Start Recognition
          </Button>
          <Button
            variant="outlined"
            onClick={stopRecognition}
            fullWidth
          >
            Stop Recognition
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {results.map((result, index) => (
          <Typography key={index} sx={{ mb: 1 }}>
            Person {index + 1}: {result.name} 
            {result.name !== 'Unknown' && 
              ` (Confidence: ${(result.confidence * 100).toFixed(2)}%)`
            }
          </Typography>
        ))}
      </Paper>
    </Box>
  );
};

export default Recognize;

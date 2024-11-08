import React from 'react';
import axios from 'axios';
import { Button, Box, Typography } from '@mui/material';

const FaceRecognition = () => {
  const handleRecognize = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/recognize');
      alert(response.data.message);
    } catch (error) {
      console.error('Error:', error);
      alert('Error starting recognition');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Face Recognition
      </Typography>
      <Button variant="contained" onClick={handleRecognize}>
        Start Recognition
      </Button>
    </Box>
  );
};

export default FaceRecognition;
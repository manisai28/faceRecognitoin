import React from 'react';
import { Container, Box } from '@mui/material';
import CapturePhoto from './components/CapturePhoto';
import FaceRecognition from './components/FaceRecognition';

const App = () => {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <CapturePhoto />
        <FaceRecognition />
      </Box>
    </Container>
  );
};

export default App;
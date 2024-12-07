import { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Button, TextField, Box, Typography, Paper } from '@mui/material';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const webcamRef = useRef(null);

  const capture = async () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!name.trim()) {
        setMessage('Please enter a name');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/register', {
        name: name,
        image: imageSrc
      });

      setMessage(response.data.message);
      setName('');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error registering face');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Register New Face
        </Typography>
        
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />

        <Box sx={{ my: 2 }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
          />
        </Box>

        <Button
          variant="contained"
          onClick={capture}
          fullWidth
        >
          Capture & Register
        </Button>

        {message && (
          <Typography 
            sx={{ mt: 2 }} 
            color={message.includes('Error') ? 'error' : 'success'}
          >
            {message}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Register;

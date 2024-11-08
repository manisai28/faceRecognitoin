const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/face_recognition')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.post('/api/capture', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  let options = {
    mode: 'text',
    pythonPath: 'python',
    scriptPath: path.join(__dirname, 'python'),
    args: [name]
  };
  
  let pyshell = new PythonShell('capture_photos.py', options);
  
  pyshell.on('message', function (message) {
    try {
      const data = JSON.parse(message);
      console.log('Python script message:', data);
      
      if (data.error) {
        return res.status(500).json({ error: data.error });
      }
      
      if (data.success === false) {
        return res.status(400).json({ message: data.message });
      }
      
      if (data.success === true) {
        return res.json({ message: data.message });
      }
      
    } catch (e) {
      console.log('Raw message from Python:', message);
    }
  });
  
  pyshell.on('error', function (err) {
    console.error('Python script error:', err);
    res.status(500).json({ error: 'Failed to execute capture script' });
  });
  
  pyshell.on('close', function () {
    console.log('Python script finished');
  });
});

app.post('/api/train', (req, res) => {
  let options = {
    mode: 'text',
    pythonPath: 'python',
    scriptPath: path.join(__dirname, 'python')
  };

  PythonShell.run('train_model.py', options)
    .then(messages => {
      console.log('Training messages:', messages);
      res.json({ message: 'Model trained successfully' });
    })
    .catch(err => {
      console.error('Training error:', err);
      res.status(500).json({ error: 'Failed to train model' });
    });
});

app.post('/api/recognize', (req, res) => {
  let options = {
    mode: 'text',
    pythonPath: 'python',
    scriptPath: path.join(__dirname, 'python')
  };

  PythonShell.run('recognize_face.py', options)
    .then(messages => {
      console.log('Recognition messages:', messages);
      res.json({ message: 'Recognition started' });
    })
    .catch(err => {
      console.error('Recognition error:', err);
      res.status(500).json({ error: 'Failed to start recognition' });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
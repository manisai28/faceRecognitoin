app.post('/api/capture', (req, res) => {
    const { name } = req.body;
    
    let options = {
      args: [name],
      scriptPath: './python' // Added scriptPath for better file location handling
    };
    
    PythonShell.run('capture_photos.py', options, function (err) {
      if (err) {
        console.error('Error in capture_photos.py:', err);
        return res.status(500).json({ error: 'Failed to capture photos' });
      }
      res.json({ message: 'Photos captured successfully' });
    });
  });
  
  app.post('/api/train', (req, res) => {
    let options = {
      scriptPath: './python'
    };
  
    PythonShell.run('train_model.py', options, function (err) {
      if (err) {
        console.error('Error in train_model.py:', err);
        return res.status(500).json({ error: 'Failed to train model' });
      }
      res.json({ message: 'Model trained successfully' });
    });
  });
  
  app.post('/api/recognize', (req, res) => {
    let options = {
      scriptPath: './python'
    };
  
    PythonShell.run('recognize_face.py', options, function (err) {
      if (err) {
        console.error('Error in recognize_face.py:', err);
        return res.status(500).json({ error: 'Failed to start recognition' });
      }
      res.json({ message: 'Recognition started' });
    });
  });
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
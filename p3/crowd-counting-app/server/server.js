const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PythonShell } = require('python-shell');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, 'image-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('./uploads')){
    fs.mkdirSync('./uploads');
}

app.post('/api/detect', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }

    let options = {
        mode: 'text',
        pythonPath: 'python',
        pythonOptions: ['-u'],
        scriptPath: path.join(__dirname, 'ml'),
        args: [req.file.path]
    };

    PythonShell.run('detect.py', options)
        .then(messages => {
            if (!messages || messages.length === 0) {
                throw new Error('No output from detection script');
            }
            
            try {
                const lastMessage = messages[messages.length - 1];
                const result = JSON.parse(lastMessage);
                
                if (result.error) {
                    throw new Error(result.error);
                }
                
                res.json(result);
            } catch (parseError) {
                console.error('Parse error:', parseError);
                res.status(500).json({ 
                    error: 'Failed to parse detection results',
                    details: messages
                });
            }
        })
        .catch(err => {
            console.error('Error:', err);
            res.status(500).json({ 
                error: 'Failed to process image',
                details: err.message
            });
        })
        .finally(() => {
            // Clean up the uploaded file
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error('Failed to delete uploaded file:', err);
            }
        });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

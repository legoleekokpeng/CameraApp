const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
// CORS is essential for allowing your Expo app to communicate with this server
app.use(cors());
app.use(express.json());

// Configure Multer for in-memory file handling
// This keeps the uploaded files in a buffer ready to be sent to RekaAI
const upload = multer({ storage: multer.memoryStorage() });

// 1. MOODBOARD UPLOAD
// Expects a multipart/form-data request with the file field named 'image'
app.post('/analyze-moodboard', upload.single('image'), (req, res) => {
  // In the future you will pass req.file.buffer to the RekaAI API here
  console.log('Moodboard received:', req.file ? req.file.originalname : 'No file');

  const responsePayload = {
    name: "Custom Moodboard Inspired",
    style_id: "cust_mood_001",
    derived_metrics: {
      lighting_type: "cinematic, low-key, warm",
      focal_depth: "shallow"
    }
  };
  
  res.json(responsePayload);
});

// 2. ENVIRONMENT ROOM SCAN
// Expects a multipart/form-data request with the file field named 'video'
app.post('/analyze-environment', upload.single('video'), (req, res) => {
  // Logic to process the video buffer goes here
  console.log('Environment scan received:', req.file ? req.file.originalname : 'No file');

  const responsePayload = {
    spatial_metric_1: 4.1, 
    spatial_metric_2: 3.4, 
    environmental_score: 0.82 
  };
  
  res.json(responsePayload);
});

// 3. THE COACHING DIRECTIVES
// I have set this as a POST request to allow your frontend to send session IDs or current state parameters in the body
app.post('/get-directives', (req, res) => {
  console.log('Directives requested. Request body:', req.body);

  const responsePayload = {
    session_id: "session_987",
    phase_control: {
      step: "Cameraman",
      coaching: "Take 2 paces backwards. Hold phone low at hip height, tilting up, and switch lens magnification to 1.5x zoom."
    },
    visual_cues: {
      step: "Pose",
      coaching: "Instruct the model to step inside the wireframe. Lean weight onto their back leg and cross ankles."
    },
    facial_guides: {
      step: "Facial expression",
      coaching: "Model should turn chin slightly toward left shoulder. Soften eyes, drop left hand casually inside jacket pocket."
    }
  };
  
  res.json(responsePayload);
});

// A simple health check route to verify the server is running
app.get('/', (req, res) => {
  res.send('Backend is operational and ready to receive requests from Expo.');
});

// Initialise the server
app.listen(port, () => {
  console.log(`Backend server is listening on port ${port}`);
});
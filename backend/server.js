require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// 1. MOODBOARD UPLOAD (Now connected to Reka API)
app.post('/analyze-moodboard', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    console.log('Processing moodboard image with Reka API...');

    // Convert the image buffer into a base64 Data URL format required by the API
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Define strict instructions so the AI returns exactly what the frontend expects
    const prompt = `
      Analyze this moodboard image. Return a JSON object with the following structure:
      {
        "name": "string (a short descriptive name for this style)",
        "style_id": "string (generate a unique alphanumeric ID)",
        "derived_metrics": {
          "lighting_type": "string (e.g. cinematic, low key, warm)",
          "focal_depth": "string (e.g. shallow, deep)"
        }
      }
      Return only the raw JSON. Do not include markdown formatting or additional text.
    `;

    // Make the network request to the Reka API
    // Note: Adjust the endpoint URL if Reka updates their documentation
    const response = await fetch('https://api.reka.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REKA_API_KEY}`
      },
      body: JSON.stringify({
        model: "reka-core",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: dataUrl } }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Reka API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the text response and parse it into a JavaScript object
    const aiText = data.choices[0].message.content;
    const cleanJson = aiText.replace(/```json|```/g, '').trim();
    const payload = JSON.parse(cleanJson);

    res.json(payload);

  } catch (error) {
    console.error('Moodboard analysis failed:', error);
    res.status(500).json({ error: 'Failed to process moodboard via AI.' });
  }
});

// 2. ENVIRONMENT ROOM SCAN (Mocked for now)
app.post('/analyze-environment', upload.single('video'), (req, res) => {
  console.log('Environment scan received.');
  res.json({
    spatial_metric_1: 4.1, 
    spatial_metric_2: 3.4, 
    environmental_score: 0.82 
  });
});

// 3. THE COACHING DIRECTIVES (Mocked for now)
app.post('/get-directives', (req, res) => {
  console.log('Directives requested.');
  res.json({
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
  });
});

app.listen(port, () => {
  console.log(`Backend server is listening on port ${port}`);
});
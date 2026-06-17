require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

function fallbackResponse(reason) {
  return {
    source: 'fallback',
    error_debug: reason,
    session_id: 'fallback_mitigation_session',
    phase_control: {
      step: 'Camera',
      coaching: 'Hold steady and keep the subject off-center.'
    },
    visual_cues: {
      step: 'Pose',
      coaching: 'Turn shoulders slightly and relax the posture.'
    },
    facial_guides: {
      step: 'Expression',
      coaching: 'Look slightly past the lens with relaxed eyes.'
    }
  };
}

function extractJson(text) {
  if (!text) throw new Error('Empty AI response');

  const cleaned = text.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (firstError) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw firstError;
    return JSON.parse(match[0]);
  }
}

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Backend is running' });
});

// ==========================================================
// LIVE ADVICE ENDPOINT
// This gives short advice while the user is still framing.
// ==========================================================
app.post('/analyze-live-frame', upload.single('image'), async (req, res) => {
  try {
    if (!process.env.REKA_API_KEY) {
      return res.status(500).json({ error: 'Missing REKA_API_KEY in .env file.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No live frame received. Expected form field name: image.' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const prompt = `
You are Steve, a professional photography coach inside a mobile camera app.

Look at this live camera frame and give ONE clear instruction before the user takes the photo.

Your advice must be:
- professional
- simple
- easy to understand
- under 12 words
- focused on one action only

Focus on the most important issue:
- framing
- lighting
- background
- angle
- subject position

Good examples:
"Move slightly left to clean the background."
"Lower the camera for a stronger angle."
"Place the subject closer to the light."
"Step back to include more context."
"Keep the subject slightly off-center."

Bad examples:
"Consider adjusting the overall compositional balance of the image."
"The lighting may benefit from improved directional control."

Return ONLY valid JSON:
{
  "live_advice": "one short professional instruction"
}
`.trim();

    const response = await fetch('https://api.reka.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REKA_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.REKA_MODEL || 'reka-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: dataUrl } },
              { type: 'text', text: prompt }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 120,
        stream: false
      })
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Reka live API error:', response.status, details);

      return res.json({
  source: 'fallback',
  live_advice: 'Hold steady and keep the subject off-center.'
});
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || '';

    let parsed;

    try {
      parsed = extractJson(aiText);
    } catch (error) {
      parsed = {
        source: 'reka_text_fallback',
        live_advice: aiText.replace(/```json|```/g, '').trim() || 'Move closer and simplify the background.'
      };
    }

    if (!parsed.live_advice) {
      parsed.live_advice = 'Move closer and keep the subject clearly framed.';
    }

    return res.json(parsed);
  } catch (error) {
    console.error('Live advice backend error:', error);

    return res.json({
  source: 'fallback',
  live_advice: 'Move closer and simplify the background.'
});
  }
});

// ==========================================================
// FINAL PHOTO ANALYSIS ENDPOINT
// This gives full advice after taking the photo.
// ==========================================================
app.post('/analyze-moodboard', upload.single('image'), async (req, res) => {
  try {
    if (!process.env.REKA_API_KEY) {
      return res.status(500).json({ error: 'Missing REKA_API_KEY in .env file.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file received. Expected form field name: image.' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const prompt = `
You are Steve, a professional photography coach inside a mobile camera app.
Analyze the uploaded photo and give concise, practical advice.

Return ONLY valid JSON.
No markdown.
No extra explanation.

Rules:
- Each coaching sentence must be under 14 words.
- Use simple and professional language.
- Give direct actions, not long explanations.
- Avoid vague words like "maybe", "consider", or "possibly".

Use this exact JSON shape:
{
  "source": "reka",
  "session_id": "realtime_reka_generation_frame",
  "phase_control": {
    "step": "Camera",
    "coaching": "short action for framing, angle, or camera movement"
  },
  "visual_cues": {
    "step": "Pose",
    "coaching": "short action for body position or posture"
  },
  "facial_guides": {
    "step": "Expression",
    "coaching": "short action for face, eyes, or head direction"
  }
}
`.trim();

    const response = await fetch('https://api.reka.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REKA_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.REKA_MODEL || 'reka-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: dataUrl } },
              { type: 'text', text: prompt }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 500,
        stream: false
      })
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Reka API error:', response.status, details);

      // Return fallback as 200 so the mobile app still receives advice.
      return res.json(fallbackResponse(`Reka API error ${response.status}: ${details}`));
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || '';
    const parsed = extractJson(aiText);

    return res.json(parsed);
  } catch (error) {
    console.error('Backend error:', error);

    // Return fallback as 200 so Expo does not show network failure.
    return res.json(fallbackResponse(error.message));
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on http://0.0.0.0:${port}`);
});
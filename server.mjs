import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Enable CORS for frontend
app.use(
  cors({
    origin: ['https://kasperjunky.github.io', 'http://localhost:8000'], // GitHub Pages and local testing
  })
);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Error: OpenAI API key is missing!');
  process.exit(1); // Exit if no API key is found
}

app.post('/api/generate', async (req, res) => {
  const { messages } = req.body;

  try {
    console.log('Received request with messages:', messages);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Using gpt-3.5-turbo
        messages,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('OpenAI API Response:', data);
      res.json(data);
    } else {
      console.error('OpenAI API Error:', data.error);
      res.status(response.status).json({ error: data.error });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 10000; // Port for Render
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

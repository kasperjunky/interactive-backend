import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Enable CORS and allow requests from specific origins
app.use(
  cors({
    origin: ['https://kasperjunky.github.io', 'http://localhost:8000'], // Allow GitHub Pages and local testing
  })
);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Debugging: Check if the API key is loaded
if (!OPENAI_API_KEY) {
  console.error('Error: OpenAI API key is missing on Render!');
  process.exit(1); // Exit if the key is not found
} else {
  console.log('OpenAI API key is loaded successfully on Render:', OPENAI_API_KEY.substring(0, 5) + '*****');
}

app.post('/api/generate', async (req, res) => {
  const { messages } = req.body;

  try {
    console.log('Received request with messages:', messages); // Debug incoming messages
    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Or gpt-4 if accessible
        messages,
      }),
    });

    const data = await response.json();
    console.log('OpenAI API Response:', data); // Debug OpenAI response

    if (response.ok) {
      res.json(data);
    } else {
      console.error('OpenAI API Error:', data.error); // Log error details from OpenAI
      res.status(response.status).json({ error: data.error });
    }
  } catch (error) {
    console.error('Server Error:', error); // Log server-side errors
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

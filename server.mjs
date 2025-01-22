import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Debugging: Check if the API key is loaded
if (!OPENAI_API_KEY) {
  console.error('Error: OpenAI API key is missing!');
  process.exit(1); // Exit the process if the key is not set
} else {
  console.log('OpenAI API key is loaded successfully.');
}

app.post('/api/generate', async (req, res) => {
  const { messages } = req.body;

  try {
    console.log('Sending request to OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4', // Use "gpt-3.5-turbo" if you don't have access to GPT-4
        messages,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('OpenAI response received successfully.');
      res.json(data);
    } else {
      console.error('OpenAI API Error:', data);
      res.status(response.status).json({ error: data });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

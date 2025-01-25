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

app.post('/api/generate', async (req, res) => {
  const { language, answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Invalid or missing 'answers' parameter." });
  }

  const messages = [
    {
      role: 'system',
      content:
        language === 'he'
          ? 'אתה עוזר שמספק תובנות עמוקות לגבי סיפורי חיים בהתבסס על תשובות שאלון של המשתמש.'
          : 'You are a helpful assistant that provides deep insights about life stories based on user questionnaire answers.',
    },
    {
      role: 'user',
      content:
        language === 'he'
          ? `הנה התשובות לשאלון: ${answers.join(', ')}. אנא ספק תובנות על סיפור חייו של משתמש זה.`
          : `Here are the answers to the questionnaire: ${answers.join(
              ', '
            )}. Please provide insights about this user’s life story.`,
    },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Use GPT-3.5 to avoid access issues
        messages,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      res.json({
        storySummary: data.choices[0].message.content,
        encouragingRewrite: "Rewrite your story in a positive and empowering way here.",
        practicalAdvice: [
          "Embrace opportunities for growth.",
          "Surround yourself with positive influences.",
          "Reflect on past experiences to find strength.",
        ],
      });
    } else {
      console.error('OpenAI API Error:', data.error);
      res.status(response.status).json({ error: data.error });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

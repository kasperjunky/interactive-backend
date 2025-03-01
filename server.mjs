// Version 4.7 Final – Now using GPT-3.5-Turbo-0125 & Improved Error Handling

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ OpenAI API key is missing! Please check your .env file.");
  process.exit(1);  // Stop server if API key is missing
}

console.log("🔑 OpenAI API Key Loaded:", OPENAI_API_KEY ? "Yes" : "No");

app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request. 'messages' must be an array." });
    }

    console.log("📡 Sending request to OpenAI...");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0125",  // Explicitly using the latest GPT-3.5-Turbo model
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${errorData.error.message}`);
    }

    const data = await response.json();
    console.log("✅ OpenAI Response Received:", JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices.length || !data.choices[0].message || !data.choices[0].message.content) {
      return res.status(500).json({ error: "Invalid response from OpenAI." });
    }

    const content = data.choices[0].message.content;
    const [storySummary, encouragingRewrite, ...practicalAdvice] = content.split("\n").filter(Boolean);

    res.json({
      storySummary: storySummary || "No story summary available.",
      encouragingRewrite: encouragingRewrite || "No encouraging rewrite available.",
      practicalAdvice: practicalAdvice.length
        ? practicalAdvice.map((advice) => advice.trim())
        : ["No practical advice available."],
    });

  } catch (error) {
    console.error("❌ Error processing request:", error.message);
    res.status(500).json({ error: error.message || "Internal server error." });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// API Route: Study Guide
app.post('/api/study-guide', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a concise, easy-to-understand study guide for: ${topic}. Structure with clear headings and key bullet points.`,
    });

    res.json({ result: response.text });
  } catch (error) {
    console.error('Study Guide Error:', error);
    res.status(500).json({ error: 'Failed to generate study guide. Please try again.' });
  }
});

// API Route: Quiz
app.post('/api/quiz', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a 3-question multiple choice quiz on '${topic}'. Return ONLY a raw JSON array, without markdown formatting or code blocks:
      [
        {
          "question": "Question text?",
          "options": ["A", "B", "C", "D"],
          "answer": "Correct option text"
        }
      ]`,
    });

    // Strip markdown code blocks if the model still includes them
    let rawText = response.text || '';
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    const quizData = JSON.parse(rawText);
    res.json({ quiz: quizData });
  } catch (error) {
    console.error('Quiz Generation Error:', error);
    res.status(500).json({ error: 'Quiz could not be generated. Please try again.' });
  }
});

module.exports = app;
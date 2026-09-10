const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static assets (HTML, CSS, JS) directly from root
app.use(express.static(path.join(__dirname, '..')));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Endpoint 1: Study Guide
app.post('/api/study-guide', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Provide a concise, easy-to-understand study guide for: ${topic}. Structure with clear headings and key bullet points.`,
    });

    res.json({ result: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate study guide. Please try again.' });
  }
});

// Endpoint 2: Quiz
app.post('/api/quiz', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Generate a 3-question multiple choice quiz on '${topic}' in strictly valid JSON format like this:
      [
        {
          "question": "Question text?",
          "options": ["A", "B", "C", "D"],
          "answer": "Correct option text"
        }
      ]`,
    });

    const cleanedText = response.text.replace(/```json|```/g, '').trim();
    const quizData = JSON.parse(cleanedText);
    res.json({ quiz: quizData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Quiz could not be generated. Please try again.' });
  }
});

// Fallback: Serve index.html for any root requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;
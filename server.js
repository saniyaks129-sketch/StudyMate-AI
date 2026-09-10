const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Endpoint 1: Generate Study Guide
app.post('/study-guide', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a concise, easy-to-understand study guide for: ${topic}. Structure with clear headings and key bullet points.`,
    });

    res.json({ result: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate study guide. Please try again.' });
  }
});

// Endpoint 2: Generate Quiz
app.post('/quiz', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

// Serve locally
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`StudyMate AI running on http://localhost:${PORT}`));
}

// Export for Vercel Serverless
module.exports = app;
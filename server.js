const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();

app.use(express.json());


// ===============================
// SERVE FRONTEND
// ===============================

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// ===============================
// GEMINI AI
// ===============================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ===============================
// GEMINI HELPER WITH RETRY
// ===============================

async function askGemini(prompt, quizMode = false) {

    for (let attempt = 1; attempt <= 3; attempt++) {

        try {

            const response = await ai.models.generateContent({
                model: "gemini-3.5-flash",
                contents: prompt,
                ...(quizMode
                    ? {
                        config: {
                            responseMimeType: "application/json"
                        }
                    }
                    : {})
            });

            return response.text;

        } catch (error) {

            console.log(
                "Gemini attempt " + attempt + " failed."
            );

            if (attempt < 3) {

                await new Promise(resolve =>
                    setTimeout(resolve, attempt * 3000)
                );

            } else {

                console.error("Gemini Error:", error);

                throw error;
            }
        }
    }
}


// ===============================
// STUDY GUIDE
// ===============================

app.post("/ask", async (req, res) => {

    try {

        const topic = req.body.topic;

        const prompt = `
You are StudyMate, an expert educational tutor.

Help a beginner understand this topic:

${topic}

Give the response in exactly this format:

EXPLANATION:
Explain the topic simply.

ANALOGY:
Give one real-world analogy.

EXAMPLE:
Give one easy example.

COMMON MISTAKES:
List 3 common mistakes.

PRACTICE QUESTIONS:
Create 5 practice questions.

STUDY PLAN:
Give a simple 3-day study plan.

Use simple language and do not include unrelated information.
`;

        const answer = await askGemini(prompt);

        res.json({
            answer: answer
        });

    } catch (error) {

        console.error("Study Guide Error:", error);

        res.status(500).json({
            error: "Gemini is temporarily unavailable. Please try again."
        });
    }
});


// ===============================
// INTERACTIVE QUIZ
// ===============================

app.post("/quiz", async (req, res) => {

    try {

        const topic = req.body.topic;

        const prompt = `
Create a beginner-friendly quiz about ${topic}.

Create exactly 5 multiple-choice questions.

Return ONLY valid JSON.

Use exactly this structure:

{
  "questions": [
    {
      "question": "Question text",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "answer": "A",
      "explanation": "Short explanation"
    }
  ]
}

Rules:

- Create exactly 5 questions.
- Every question must have A, B, C and D.
- The answer must be exactly A, B, C or D.
- Keep questions beginner-friendly.
- Make the questions educational.
`;

        const answer = await askGemini(prompt, true);

        const quiz = JSON.parse(answer);

        res.json(quiz);

    } catch (error) {

        console.error("Quiz Error:", error);

        res.status(500).json({
            error: "Quiz could not be generated. Please try again."
        });
    }
});


// ===============================
// START SERVER LOCALLY
// ===============================

if (require.main === module) {

    app.listen(3000, () => {

        console.log(
            "StudyMate AI running at http://localhost:3000"
        );

    });

}


// ===============================
// VERCEL
// ===============================

module.exports = app;
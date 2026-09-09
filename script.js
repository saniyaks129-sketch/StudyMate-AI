// =================================
// INTERACTIVE QUIZ
// =================================

async function generateQuiz() {

    const topic = document.getElementById("topic").value.trim();
    const result = document.getElementById("result");

    if (topic === "") {
        alert("Please enter a topic first!");
        return;
    }

    result.innerHTML = `
        <h2>🧠 Creating Your Quiz...</h2>
        <p>StudyMate is preparing your questions...</p>
    `;

    try {

        const response = await fetch("/quiz", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                topic: topic
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Check that Gemini returned questions
        if (
            !data.questions ||
            !Array.isArray(data.questions) ||
            data.questions.length === 0
        ) {
            throw new Error(
                "Quiz questions were not generated correctly. Please try again."
            );
        }

        let currentQuestion = 0;
        let score = 0;
        let answered = false;


        // ===============================
        // SHOW QUESTION
        // ===============================

        function showQuestion() {

            answered = false;

            const q = data.questions[currentQuestion];

            if (!q || !q.options) {

                result.innerHTML = `
                    <h2>❌ Quiz Error</h2>
                    <p>This question was not generated correctly.</p>
                `;

                return;
            }

            result.innerHTML = `

                <h2>🧠 ${topic} Quiz</h2>

                <div class="study-card">

                    <h3>
                        Question ${currentQuestion + 1}
                        of ${data.questions.length}
                    </h3>

                    <p>
                        <strong>${q.question}</strong>
                    </p>

                    <button
                        class="answer-button"
                        onclick="selectAnswer('A')"
                    >
                        A. ${q.options.A}
                    </button>

                    <button
                        class="answer-button"
                        onclick="selectAnswer('B')"
                    >
                        B. ${q.options.B}
                    </button>

                    <button
                        class="answer-button"
                        onclick="selectAnswer('C')"
                    >
                        C. ${q.options.C}
                    </button>

                    <button
                        class="answer-button"
                        onclick="selectAnswer('D')"
                    >
                        D. ${q.options.D}
                    </button>

                    <p id="feedback"></p>

                </div>
            `;
        }


        // ===============================
        // CHECK ANSWER
        // ===============================

        window.selectAnswer = function(selected) {

            if (answered) {
                return;
            }

            answered = true;

            const q = data.questions[currentQuestion];

            const feedback =
                document.getElementById("feedback");


            if (selected === q.answer) {

                score++;

                feedback.innerHTML = `
                    <strong>✅ Correct!</strong>
                    <br><br>
                    ${q.explanation}
                `;

            } else {

                feedback.innerHTML = `
                    <strong>❌ Incorrect!</strong>
                    <br><br>
                    Correct answer: ${q.answer}
                    <br><br>
                    ${q.explanation}
                `;
            }


            // Go to next question
            setTimeout(() => {

                currentQuestion++;

                if (
                    currentQuestion <
                    data.questions.length
                ) {

                    showQuestion();

                } else {

                    showFinalScore();

                }

            }, 2000);
        };


        // ===============================
        // FINAL SCORE
        // ===============================

        function showFinalScore() {

            let message;

            if (score === 5) {

                message =
                    "🌟 Excellent! You mastered this topic!";

            } else if (score >= 3) {

                message =
                    "👏 Good job! Keep practicing!";

            } else {

                message =
                    "📚 Keep studying and try again!";
            }


            result.innerHTML = `

                <h2>🎉 Quiz Completed!</h2>

                <div class="study-card">

                    <h3>🏆 Your Score</h3>

                    <p
                        style="
                        font-size:32px;
                        text-align:center;
                        font-weight:bold;
                        "
                    >
                        ${score} / ${data.questions.length}
                    </p>

                    <p style="text-align:center;">
                        ${message}
                    </p>

                    <button
                        class="generate-button"
                        onclick="generateQuiz()"
                    >
                        🔄 Try Again
                    </button>

                </div>
            `;
        }


        // Start quiz
        showQuestion();

    } catch (error) {

        console.error("Quiz Error:", error);

        result.innerHTML = `
            <h2>❌ Quiz Error</h2>

            <p>
                ${error.message}
            </p>

            <button
                class="quiz-button"
                onclick="generateQuiz()"
            >
                🔄 Try Again
            </button>
        `;
    }
}
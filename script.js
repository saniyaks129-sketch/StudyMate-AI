const topicInput = document.getElementById('topicInput');
const guideBtn = document.getElementById('guideBtn');
const quizBtn = document.getElementById('quizBtn');
const outputCard = document.getElementById('outputCard');
const outputContent = document.getElementById('outputContent');

async function handleFetch(endpoint) {
  const topic = topicInput.value.trim();
  if (!topic) {
    alert('Please enter a topic first!');
    return;
  }

  outputCard.classList.remove('hidden');
  outputContent.innerHTML = '<p class="spinner">✨ Generating your content with Gemini AI...</p>';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });

    const data = await response.json();

    if (data.error) {
      outputContent.innerHTML = `<p style="color: red;">❌ ${data.error}</p>`;
      return;
    }

    if (data.result) {
      outputContent.innerHTML = `<h3>Generated Study Guide</h3><div style="white-space: pre-wrap; margin-top: 1rem;">${data.result}</div>`;
    } else if (data.quiz) {
      let html = `<h3>Knowledge Quiz</h3><div style="margin-top: 1rem;">`;
      data.quiz.forEach((q, i) => {
        html += `<div style="margin-bottom: 1.2rem;">
          <p><strong>Q${i + 1}: ${q.question}</strong></p>
          <ul style="margin-left: 1.5rem; margin-top: 0.3rem;">
            ${q.options.map(opt => `<li>${opt}</li>`).join('')}
          </ul>
        </div>`;
      });
      html += `</div>`;
      outputContent.innerHTML = html;
    }
  } catch (err) {
    outputContent.innerHTML = `<p style="color: red;">❌ Failed to fetch response. Please try again.</p>`;
  }
}

guideBtn.addEventListener('click', () => handleFetch('/api/study-guide'));
quizBtn.addEventListener('click', () => handleFetch('/api/quiz'));
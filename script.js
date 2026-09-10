const topicInput = document.getElementById('topicInput');
const guideBtn = document.getElementById('guideBtn');
const quizBtn = document.getElementById('quizBtn');
const outputCard = document.getElementById('outputCard');
const outputContent = document.getElementById('outputContent');

// 1. Generate Study Guide Handler
guideBtn.addEventListener('click', async () => {
  const topic = topicInput.value.trim();
  if (!topic) return alert('Please enter a topic first!');

  showLoading('Generating your study guide...');

  try {
    const res = await fetch('/study-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to fetch');

    outputContent.innerHTML = `
      <h2 style="margin-bottom: 1rem;">📖 ${topic} Study Guide</h2>
      <div style="line-height: 1.6; white-space: pre-wrap;">${data.result}</div>
    `;
  } catch (err) {
    showError(err.message);
  }
});

// 2. Generate Quiz Handler
quizBtn.addEventListener('click', async () => {
  const topic = topicInput.value.trim();
  if (!topic) return alert('Please enter a topic first!');

  showLoading('Building interactive quiz...');

  try {
    const res = await fetch('/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to fetch');

    renderQuiz(data.quiz, topic);
  } catch (err) {
    showError(err.message);
  }
});

function showLoading(msg) {
  outputCard.classList.remove('hidden');
  outputContent.innerHTML = `<div class="spinner">⏳ ${msg}</div>`;
}

function showError(msg) {
  outputCard.classList.remove('hidden');
  outputContent.innerHTML = `
    <h3 style="color: #ef4444; margin-bottom: 0.5rem;">❌ Request Failed</h3>
    <p style="color: #64748b;">${msg}</p>
  `;
}

function renderQuiz(questions, topic) {
  let html = `<h2 style="margin-bottom: 1rem;">🧠 Quiz: ${topic}</h2>`;
  
  questions.forEach((q, idx) => {
    html += `
      <div style="margin-bottom: 1.5rem;">
        <p style="font-weight: 700; margin-bottom: 0.5rem;">${idx + 1}. ${q.question}</p>
        ${q.options.map(opt => `
          <label style="display: block; padding: 0.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.4rem; cursor: pointer;">
            <input type="radio" name="q${idx}" value="${opt}"> ${opt}
          </label>
        `).join('')}
      </div>
    `;
  });

  outputContent.innerHTML = html;
}
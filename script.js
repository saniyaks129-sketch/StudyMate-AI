// Example fetch call inside script.js for Study Guide:
const response = await fetch('/api/study-guide', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic }),
});

// Example fetch call inside script.js for Quiz:
const response = await fetch('/api/quiz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic }),
});
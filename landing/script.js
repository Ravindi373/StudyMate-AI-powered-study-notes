// ---- Typing effect for hero pitch ----
const pitchEl = document.getElementById('typedPitch');
const pitchText = "Capture notes, get instant AI summaries, and quiz yourself — all in one place.";
let charIndex = 0;

function typeWriter() {
  if (charIndex <= pitchText.length) {
    pitchEl.textContent = pitchText.slice(0, charIndex);
    charIndex++;
    setTimeout(typeWriter, 28);
  }
}
typeWriter();

// ---- FAQ accordion ----
document.querySelectorAll('.faq-item').forEach((item) => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ---- Dark mode toggle ----
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('studymate-theme', theme);
}

const savedTheme = localStorage.getItem('studymate-theme') || 'light';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(current);
});

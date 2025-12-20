// screen2.js - message screen logic for screen2.html

const heroImg = document.getElementById('heroImg');
const dialogue = document.getElementById('dialogue');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indexIndicator = document.getElementById('indexIndicator');
const avatarImg = document.getElementById('avatarImg');
const closeBtn = document.getElementById('closeBtn');

let messages = [];
let index = 0;

function normalizeItems(raw) {
  return (raw || []).map((item) => {
    if (typeof item === 'string') return { text: item };
    return {
      text: item.text || '',
      audio: item.audio || null,
      image: item.image || null,
    };
  });
}

function trySetImage(imgName) {
  if (!imgName) {
    heroImg.src = '';
    heroImg.alt = '';
    return;
  }
  const exts = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
  let i = 0;
  function tryNext() {
    if (i >= exts.length) {
      heroImg.src = '';
      heroImg.alt = '';
      return;
    }
    const attempt = `image/${imgName}${exts[i]}`;
    heroImg.onerror = () => {
      i += 1;
      tryNext();
    };
    heroImg.src = attempt;
    heroImg.alt = imgName;
  }
  tryNext();
}

function render() {
  const item = messages[index];
  if (!item) {
    dialogue.textContent = '';
    trySetImage(null);
    indexIndicator.textContent = '';
    closeBtn.style.display = 'none';
    return;
  }
  dialogue.textContent = item.text || '';
  trySetImage(item.image);
  indexIndicator.textContent = `${index + 1}/${messages.length}`;
  // Show X button only on last message
  if (index === messages.length - 1) {
    closeBtn.style.display = 'flex';
  } else {
    closeBtn.style.display = 'none';
  }
}

function go(delta) {
  const next = index + delta;
  if (next < 0 || next >= messages.length) return;
  index = next;
  render();
}

prevBtn.addEventListener('click', () => go(-1));
nextBtn.addEventListener('click', () => go(1));
closeBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Example: load lastDayMessage for demo
fetch('message.json')
  .then((r) => r.json())
  .then((data) => {
    // You can change this to load other message types
    messages = normalizeItems(data.lastDayMessage);
    render();
  })
  .catch((err) => {
    console.error('Failed to load message.json', err);
    dialogue.textContent = 'Failed to load messages.';
  });

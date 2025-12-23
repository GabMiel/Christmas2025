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
let currentAudio = null;

// Normalize JSON items into {text, audio, image}
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

// Image loader with fallback extensions
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
    const attempt = `../image/${imgName}${exts[i]}`;
    heroImg.onerror = () => {
      i += 1;
      tryNext();
    };
    heroImg.src = attempt;
    heroImg.alt = imgName;
  }
  tryNext();
}

// Avatar loader
function trySetAvatar() {
  avatarImg.src = '../image/avatar.jpg';
  avatarImg.alt = 'avatar';
}

// Audio loader with fallback extensions
function playAudioFor(item) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (!item || !item.audio) return;

  const base = `../audio/${item.audio}`;
  const exts = ['.mp3', '.wav', '.ogg'];
  let i = 0;

  function tryNext() {
    if (i >= exts.length) return;
    const url = base + exts[i];
    const a = new Audio(url);
    a.oncanplay = () => {
      currentAudio = a;
      a.play().catch((e) => console.warn('play failed', e));
    };
    a.onerror = () => {
      i += 1;
      tryNext();
    };
  }
  tryNext();
}

// Render current message
function render() {
  const item = messages[index];
  if (!item) {
    dialogue.textContent = 'No messages found.';
    trySetImage(null);
    trySetAvatar();
    indexIndicator.textContent = '';
    closeBtn.style.display = 'none';
    return;
  }
  dialogue.textContent = item.text || '';
  trySetImage(item.image);
  trySetAvatar();
  indexIndicator.textContent = `${index + 1}/${messages.length}`;
  closeBtn.style.display = index === messages.length - 1 ? 'flex' : 'none';
  playAudioFor(item);
}

// Navigation
function go(delta) {
  const next = index + delta;
  if (next < 0 || next >= messages.length) return;
  index = next;
  render();
}

prevBtn.addEventListener('click', () => go(-1));
nextBtn.addEventListener('click', () => go(1));
closeBtn.addEventListener('click', () => {
  window.location.href = 'screen.html';
});

// Load JSON and select only christmasMessage
fetch('../message.json')
  .then((r) => r.json())
  .then((data) => {
    messages = normalizeItems(data.christmasMessage || []);
    index = 0;
    render();
  })
  .catch((err) => {
    console.error('Failed to load message.json', err);
    dialogue.textContent = 'Failed to load messages.';
  });
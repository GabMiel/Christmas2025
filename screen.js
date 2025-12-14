// X button on choice screen redirects to index.html
const choiceCloseBtn = document.getElementById('choiceCloseBtn');
if (choiceCloseBtn) {
  choiceCloseBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}
// screen.js - loads message.json and displays messages with image/audio navigation


// UI elements
const choiceScreen = document.getElementById('choiceScreen');
const messageScreen = document.getElementById('messageScreen');
const closeBtn = document.getElementById('closeBtn');
const heroImg = document.getElementById('heroImg');
const dialogue = document.getElementById('dialogue');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indexIndicator = document.getElementById('indexIndicator');
const avatarImg = document.getElementById('avatarImg');

let messages = [];
let currentAudio = null;
let index = 0;
let selectedType = null;
let selectedName = null;

function normalizeItems(raw) {
  // raw may be array of objects {text, audio, image} or array of strings
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

  // Try common extensions; onerror we'll fall back to the next one
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

function playAudioFor(item) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (!item || !item.audio) return;

  const base = `audio/${item.audio}`;
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
  // Auto-play on navigation
  playAudioFor(messages[index]);
}


prevBtn.addEventListener('click', () => go(-1));
nextBtn.addEventListener('click', () => go(1));
closeBtn.addEventListener('click', () => {
  // Return to choice screen
  messageScreen.style.display = 'none';
  choiceScreen.style.display = 'flex';
  messages = [];
  index = 0;
  selectedType = null;
  selectedName = null;
});


// Choice screen logic
fetch('message.json')
  .then((r) => r.json())
  .then((data) => {
    // Attach click handlers for choices
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedType = btn.getAttribute('data-type');
        index = 0;
        // Hide choice, show message UI
        choiceScreen.style.display = 'none';
        messageScreen.style.display = 'block';

        // Load messages based on type
        if (selectedType === 'personal') {
          // Show a prompt to select a name (reuse name input logic)
          // For now, just pick the first name in personalMessages
          const names = Object.keys(data.personalMessages || {});
          if (names.length > 0) {
            selectedName = names[0];
            messages = normalizeItems(data.personalMessages[selectedName]);
          } else {
            messages = [];
          }
        } else if (selectedType === 'lastday') {
          messages = normalizeItems(data.lastDayMessage);
        } else if (selectedType === 'christmas') {
          messages = normalizeItems(data.christmasMessage);
        } else if (selectedType === 'newyear') {
          messages = normalizeItems(data.newYearMessage);
        } else {
          messages = [];
        }
        render();
        playAudioFor(messages[index]);
      });
    });
  })
  .catch((err) => {
    console.error('Failed to load message.json', err);
    if (choiceScreen) choiceScreen.innerHTML = 'Failed to load messages.';
  });

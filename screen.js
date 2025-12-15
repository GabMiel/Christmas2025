// X button on choice screen → back to index
const choiceCloseBtn = document.getElementById('choiceCloseBtn');
if (choiceCloseBtn) {
  choiceCloseBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

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

// Read sessionStorage
const matchType = sessionStorage.getItem("matchType");
const matchName = sessionStorage.getItem("matchName");
const matchKey = sessionStorage.getItem("matchKey");

// Normalize message items
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

// Audio loader with fallback extensions
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

// Render message
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

  closeBtn.style.display = index === messages.length - 1 ? 'flex' : 'none';
}

// Navigation
function go(delta) {
  const next = index + delta;
  if (next < 0 || next >= messages.length) return;
  index = next;
  render();
  playAudioFor(messages[index]);
}

prevBtn.addEventListener('click', () => go(-1));
nextBtn.addEventListener('click', () => go(1));

closeBtn.addEventListener('click', () => {
  messageScreen.style.display = 'none';
  choiceScreen.style.display = 'flex';
  messages = [];
  index = 0;
});

// Load JSON
fetch('message.json')
  .then((r) => r.json())
  .then((data) => {

    // ✅ If system message → auto-load
    if (matchType === "system" && matchKey) {
      choiceScreen.style.display = "none";
      messageScreen.style.display = "block";

      messages = normalizeItems(data.systemMessages[matchKey] || []);
      index = 0;

      render();
      playAudioFor(messages[index]);

      sessionStorage.clear();
      return;
    }

    // ✅ Otherwise show choice screen
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedType = btn.getAttribute('data-type');
        index = 0;

        choiceScreen.style.display = 'none';
        messageScreen.style.display = 'block';

        if (selectedType === 'personal') {
          if (matchName) {
            messages = normalizeItems(data.personalMessages[matchName] || []);
          } else {
            const names = Object.keys(data.personalMessages || {});
            if (names.length > 0) {
              messages = normalizeItems(data.personalMessages[names[0]]);
            }
          }
        } else if (selectedType === 'lastday') {
          messages = normalizeItems(data.lastDayMessage);
        } else if (selectedType === 'christmas') {
          messages = normalizeItems(data.christmasMessage);
        } else if (selectedType === 'newyear') {
          messages = normalizeItems(data.newYearMessage);
        }

        render();
        playAudioFor(messages[index]);

        sessionStorage.clear();
      });
    });

  })
  .catch((err) => {
    console.error('Failed to load message.json', err);
    choiceScreen.innerHTML = 'Failed to load messages.';
  });
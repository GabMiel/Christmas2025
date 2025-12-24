
document.querySelectorAll('.gift-box').forEach(box => {
  box.addEventListener('click', () => {
    const type = box.getAttribute('data-type');
    if (type === 'christmasVideo') {
      
      window.location.href = 'screen3.html';
    } else if (type === 'christmas') {
      
      window.location.href = 'screen2.html';
    }
  });
});



const choiceCloseBtn = document.getElementById('choiceCloseBtn');
if (choiceCloseBtn) {
  choiceCloseBtn.addEventListener('click', () => {
    window.location.href = '/index.html';
  });
}

let messages = [];
let currentAudio = null;
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
  closeBtn.style.display = index === messages.length - 1 ? 'flex' : 'none';
}


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



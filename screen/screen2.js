

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


function normalizeItems(raw) {
  return (raw || []).map((item) => ({
    text: item.text || '',
    audio: item.audio || null,
    image: item.image || null,
  }));
}


function trySetImage(imgName) {
  if (!imgName) {
    heroImg.style.display = 'none';
    return;
  }

  
  const correctedName = imgName.replace('.jpg', '.png');
  
  heroImg.src = `../image/${correctedName}`;
  heroImg.style.display = 'block';

  heroImg.onerror = () => {
    console.error("Still can't find:", correctedName);
    heroImg.style.display = 'none';
  };
}


function trySetAvatar() {
  avatarImg.src = '../image/avatar.jpg';
  avatarImg.alt = 'avatar';
}


function playAudioFor(item) {
  
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  
  if (!item || !item.audio) return;

  const url = `../audio/${item.audio}`;
  const a = new Audio(url);
  
  
  currentAudio = a;

  a.play().catch((e) => {
    console.warn(`Audio playback issue for ${item.audio}:`, e);
  });
}


function render() {
  const item = messages[index];
  if (!item) {
    dialogue.textContent = 'No messages found.';
    trySetImage(null);
    indexIndicator.textContent = '';
    closeBtn.style.display = 'none';
    return;
  }

  
  dialogue.textContent = item.text || '';
  
  
  trySetImage(item.image);
  trySetAvatar();
  
  
  indexIndicator.textContent = `${index + 1} / ${messages.length}`;
  
  
  closeBtn.style.display = index === messages.length - 1 ? 'flex' : 'none';
  
  
  playAudioFor(item);
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
  
  sessionStorage.clear();
  window.location.href = '../index.html'; 
});


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
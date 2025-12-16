document.addEventListener("DOMContentLoaded", () => {

/* ✨ GOLDEN FULL-RADIUS EXPLOSION ✨ */
const sparkleBtn = document.getElementById("christmasButton");
if (sparkleBtn) {
  sparkleBtn.addEventListener("click", () => {

    const maxRadius = 500; // how far particles can go

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("span");
      particle.classList.add("particle");

      // Bigger sparkles
      const size = Math.random() * 16 + 12;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Random angle
      const angle = Math.random() * Math.PI * 2;

      // Random distance (THIS FIXES THE RING PROBLEM)
      const distance = Math.random() * maxRadius;

      // Convert polar → cartesian
      const x = sparkleBtn.offsetWidth / 2 + Math.cos(angle) * distance;
      const y = sparkleBtn.offsetHeight / 2 + Math.sin(angle) * distance;

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      // Golden color range
      const hue = 45 + Math.random() * 20;
      const lightness = 60 + Math.random() * 20;
      particle.style.background = `hsl(${hue}deg 100% ${lightness}%)`;

      sparkleBtn.appendChild(particle);

      setTimeout(() => particle.remove(), 1500);
    }
  });
}

  /* ✅ SEARCH + REDIRECT LOGIC */
  const input = document.getElementById("nameInput");
  const output = document.getElementById("output");

  let personalMessages = {};
  let multipleMatchMessage = [];
  let fallbackMessage = [];

  fetch('message.json')
    .then((res) => res.json())
    .then((data) => {
      personalMessages = data.personalMessages || {};
      multipleMatchMessage = (data.systemMessages && data.systemMessages.multipleMatch) || [];
      fallbackMessage = (data.systemMessages && data.systemMessages.fallback) || [];

      if (sparkleBtn) {
        sparkleBtn.addEventListener('click', handleClick);
      }
    })
    .catch((err) => {
      console.error('Failed to load message.json', err);
      if (sparkleBtn) {
        sparkleBtn.addEventListener('click', handleClick);
      }
    });

  function handleClick() {
  const userInput = input.value.toLowerCase().trim();
  output.textContent = '';
  if (!userInput) return;

  const matches = [];
  for (const fullName in personalMessages) {
    if (fullName.toLowerCase().includes(userInput)) {
      matches.push(fullName);
    }
  }

  // Clear previous session data
  sessionStorage.clear();

  if (matches.length === 1) {
    sessionStorage.setItem("matchType", "personal");
    sessionStorage.setItem("matchName", matches[0]);
  } else if (matches.length > 1) {
    sessionStorage.setItem("matchType", "system");
    sessionStorage.setItem("matchKey", "multipleMatch");
  } else {
    sessionStorage.setItem("matchType", "system");
    sessionStorage.setItem("matchKey", "fallback");
  }

  // ⭐ Delay redirect so sparkles show
  setTimeout(() => {
    window.location.href = "screen.html";
  }, 1000); // adjust this number if you want longer
}
});
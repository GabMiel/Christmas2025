document.addEventListener("DOMContentLoaded", () => {
  const sparkleBtn = document.getElementById("christmasButton");
  const input = document.getElementById("nameInput");
  const output = document.getElementById("output");

  let authNames = [];
  let multipleMatchMessage = [];
  let fallbackMessage = [];

  
  let toastContainer = document.getElementById("toast");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast";
    document.body.appendChild(toastContainer);
  }

  function showToast(messages) {
    
    toastContainer.innerHTML = messages.join("<br>");
    toastContainer.classList.add("show");
    
    
    setTimeout(() => {
      toastContainer.classList.remove("show");
    }, 4000);
  }

 
  if (sparkleBtn) {
    sparkleBtn.addEventListener("click", () => {
      if (!input.value.trim()) return;

      const maxRadius = 500; 
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement("span");
        particle.classList.add("particle");
        const size = Math.random() * 16 + 12;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * maxRadius;
        const x = sparkleBtn.offsetWidth / 2 + Math.cos(angle) * distance;
        const y = sparkleBtn.offsetHeight / 2 + Math.sin(angle) * distance;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        const hue = 45 + Math.random() * 20;
        const lightness = 60 + Math.random() * 20;
        particle.style.background = `hsl(${hue}deg 100% ${lightness}%)`;
        sparkleBtn.appendChild(particle);
        setTimeout(() => particle.remove(), 2000);
      }
    });
  }

 
  fetch('message.json')
    .then((res) => res.json())
    .then((data) => {
      authNames = data.authNames || [];
      multipleMatchMessage = data.systemMessages?.multipleMatch || [];
      fallbackMessage = data.systemMessages?.fallback || [];

      if (sparkleBtn) {
        sparkleBtn.addEventListener('click', handleClick);
      }
    })
    .catch((err) => console.error('Failed to load message.json', err));

  function handleClick() {
    const userInput = input.value.toLowerCase().trim();
    if (!userInput) return;

    
    const matches = authNames.filter(name => name.toLowerCase().includes(userInput));
    sessionStorage.clear();

    if (matches.length === 1) {
      
      sessionStorage.setItem("matchType", "auth");
      sessionStorage.setItem("matchName", matches[0]);
      
      setTimeout(() => {
        window.location.href = "screen/screen.html";
      }, 1000);

    } else if (matches.length > 1) {
      
      showToast(multipleMatchMessage);
    } else {
      
      showToast(fallbackMessage);
    }
  }
});
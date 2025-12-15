const input = document.getElementById("nameInput");
const button = document.getElementById("submitBtn");
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

    button.addEventListener('click', handleClick);
  })
  .catch((err) => {
    console.error('Failed to load message.json', err);
    button.addEventListener('click', handleClick);
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

  window.location.href = "screen.html";
}
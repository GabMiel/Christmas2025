// Load messages from `message.json` to avoid duplicating content here.
const input = document.getElementById("nameInput");
const button = document.getElementById("submitBtn");
const output = document.getElementById("output");

let personalMessages = {};
let multipleMatchMessage = [];
let fallbackMessage = [];

// Fetch the JSON file (must be served alongside the page). Fallback to
// empty structures if loading fails so UI doesn't break.
fetch('message.json')
  .then((res) => res.json())
  .then((data) => {
    personalMessages = data.personalMessages || {};
    multipleMatchMessage = (data.systemMessages && data.systemMessages.multipleMatch) || [];
    fallbackMessage = (data.systemMessages && data.systemMessages.fallback) || [];

    // Attach handler after messages are available
    button.addEventListener('click', handleClick);
  })
  .catch((err) => {
    console.error('Failed to load message.json', err);
    // Attach handler anyway so the page remains interactive (will show fallback)
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
  // Redirect to screen.html and pass parameters so the dedicated page
  // can render the dialogue with image/audio and navigation.
  if (matches.length === 1) {
    const params = new URLSearchParams({ type: 'personal', name: matches[0], index: '0' });
    window.location.href = `screen.html?${params.toString()}`;
  } else if (matches.length > 1) {
    const params = new URLSearchParams({ type: 'system', key: 'multipleMatch' });
    window.location.href = `screen.html?${params.toString()}`;
  } else {
    const params = new URLSearchParams({ type: 'system', key: 'fallback' });
    window.location.href = `screen.html?${params.toString()}`;
  }
}

function showLines(lines) {
  if (!Array.isArray(lines)) {
    output.textContent = String(lines);
    return;
  }
  output.textContent = lines.join('\n');
}

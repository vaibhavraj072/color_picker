document.addEventListener('DOMContentLoaded', () => {
  const colorPreview = document.getElementById('color-preview');
  const rgbCode = document.getElementById('rgb-code');
  const hexCode = document.getElementById('hex-code');
  const copyRgbBtn = document.getElementById('copy-rgb');
  const copyHexBtn = document.getElementById('copy-hex');
  const pickButton = document.getElementById('pick-button');

  // Copy button handlers
  copyRgbBtn.addEventListener('click', () => copyToClipboard(rgbCode.innerText));
  copyHexBtn.addEventListener('click', () => copyToClipboard(hexCode.innerText));

  // Color picker button handler
  pickButton.addEventListener('click', () => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          chrome.tabs.executeScript(
              tabs[0].id,
              {file: 'colorPicker.js'}
          );
      });
  });
});

// Function to copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  showCopiedMessage();
}

// Function to show copied message
function showCopiedMessage() {
  const message = document.createElement('div');
  message.textContent = 'Copied!';
  message.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 5px 10px;
      border-radius: 3px;
      font-size: 12px;
  `;
  document.body.appendChild(message);
  setTimeout(() => document.body.removeChild(message), 1000);
}

// Function to update display
function updateDisplay(color) {
  const colorPreview = document.getElementById('color-preview');
  const rgbCode = document.getElementById('rgb-code');
  const hexCode = document.getElementById('hex-code');
  
  colorPreview.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
  rgbCode.textContent = `RGB(${color.r}, ${color.g}, ${color.b})`;
  hexCode.textContent = color.hex;
}

// Listen for messages from color picker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'preview-update') {
      updateDisplay(message.color);
  } else if (message.type === 'color-selected') {
      updateDisplay(message.color);
      // Keep popup open for a moment to show final color
      setTimeout(() => window.close(), 500);
  } else if (message.type === 'picker-error') {
      document.getElementById('pick-button').textContent = 'Error - Try Again';
  }
});
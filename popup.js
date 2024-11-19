document.addEventListener('DOMContentLoaded', () => {
  const colorPreview = document.getElementById('color-preview');
  const rgbCode = document.getElementById('rgb-code');
  const hexCode = document.getElementById('hex-code');
  const pickButton = document.getElementById('pick-button');
  const copyRgbButton = document.getElementById('copy-rgb');
  const copyHexButton = document.getElementById('copy-hex');
  const popupHeader = document.getElementById('popup-header');
  const closeBtn = document.getElementById('close-btn');

  let currentColor = { rgb: 'RGB(0, 0, 0)', hex: '#000000' };
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  // Draggable popup functionality
  popupHeader.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDragging);

  function startDragging(e) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const popupStyle = window.getComputedStyle(document.body);
      startLeft = parseInt(popupStyle.left || '0');
      startTop = parseInt(popupStyle.top || '0');
  }

  function drag(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      document.body.style.position = 'fixed';
      document.body.style.left = `${startLeft + dx}px`;
      document.body.style.top = `${startTop + dy}px`;
  }

  function stopDragging() {
      isDragging = false;
  }

  // Close button functionality
  closeBtn.addEventListener('click', () => {
      window.close();
  });

  // Copy to clipboard function
  function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
          showTooltip('Copied!');
      }).catch(err => {
          console.error('Failed to copy: ', err);
      });
  }

  // Show temporary tooltip
  function showTooltip(message) {
      const tooltip = document.createElement('div');
      tooltip.classList.add('copied-tooltip');
      tooltip.textContent = message;
      tooltip.style.top = `${event.clientY + 10}px`;
      tooltip.style.left = `${event.clientX + 10}px`;
      document.body.appendChild(tooltip);
      
      setTimeout(() => {
          tooltip.style.opacity = '1';
          setTimeout(() => {
              tooltip.style.opacity = '0';
              setTimeout(() => {
                  document.body.removeChild(tooltip);
              }, 200);
          }, 1000);
      }, 10);
  }

  // Event listeners for copy buttons
  copyRgbButton.addEventListener('click', () => {
      copyToClipboard(currentColor.rgb);
  });

  copyHexButton.addEventListener('click', () => {
      copyToClipboard(currentColor.hex);
  });

  // Color code elements copy on click
  rgbCode.addEventListener('click', () => {
      copyToClipboard(currentColor.rgb);
  });

  hexCode.addEventListener('click', () => {
      copyToClipboard(currentColor.hex);
  });

  // Pick color button
  pickButton.addEventListener('click', () => {
      document.body.classList.add('dropper-cursor');
      
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {action: "pickColor"}, (response) => {
              document.body.classList.remove('dropper-cursor');
              
              if (response && response.color) {
                  // Update UI with picked color
                  colorPreview.style.backgroundColor = response.color;
                  
                  // Convert color to RGB and HEX
                  const rgbMatch = response.color.match(/\d+/g);
                  if (rgbMatch) {
                      currentColor.rgb = `RGB(${rgbMatch[0]}, ${rgbMatch[1]}, ${rgbMatch[2]})`;
                      currentColor.hex = rgbToHex(parseInt(rgbMatch[0]), parseInt(rgbMatch[1]), parseInt(rgbMatch[2]));
                      
                      rgbCode.textContent = currentColor.rgb;
                      hexCode.textContent = currentColor.hex;
                  }
              }
          });
      });
  });

  // Utility function to convert RGB to HEX
  function rgbToHex(r, g, b) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
});
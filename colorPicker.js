(function() {
  let isPickerActive = false;
  let colorPickerOverlay = null;

  // Create color picker overlay
  function createColorPickerOverlay() {
      colorPickerOverlay = document.createElement('div');
      colorPickerOverlay.style.position = 'fixed';
      colorPickerOverlay.style.top = '0';
      colorPickerOverlay.style.left = '0';
      colorPickerOverlay.style.width = '100%';
      colorPickerOverlay.style.height = '100%';
      colorPickerOverlay.style.zIndex = '9999';
      colorPickerOverlay.style.cursor = 'none';
      colorPickerOverlay.style.backgroundColor = 'transparent';
      document.body.appendChild(colorPickerOverlay);
  }

  // Remove color picker overlay
  function removeColorPickerOverlay() {
      if (colorPickerOverlay) {
          document.body.removeChild(colorPickerOverlay);
          colorPickerOverlay = null;
      }
      isPickerActive = false;
  }

  // Listen for color pick message from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "pickColor") {
          isPickerActive = true;
          createColorPickerOverlay();

          // Temporary color preview div
          const previewDiv = document.createElement('div');
          previewDiv.style.position = 'fixed';
          previewDiv.style.width = '100px';
          previewDiv.style.height = '100px';
          previewDiv.style.border = '2px solid white';
          previewDiv.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
          previewDiv.style.zIndex = '10000';
          previewDiv.style.pointerEvents = 'none';
          previewDiv.style.display = 'flex';
          previewDiv.style.alignItems = 'center';
          previewDiv.style.justifyContent = 'center';
          previewDiv.style.fontSize = '12px';
          previewDiv.style.fontWeight = 'bold';
          previewDiv.style.textShadow = '1px 1px 2px black';
          document.body.appendChild(previewDiv);

          // Mouse move event to show color preview
          const mouseMoveHandler = (e) => {
              if (!isPickerActive) return;
              
              previewDiv.style.left = `${e.clientX - 50}px`;
              previewDiv.style.top = `${e.clientY - 50}px`;
              
              const color = getColorAtPixel(e);
              previewDiv.style.backgroundColor = color;
              
              // Add color value text
              const rgbMatch = color.match(/\d+/g);
              const hexColor = rgbToHex(
                  parseInt(rgbMatch[0]), 
                  parseInt(rgbMatch[1]), 
                  parseInt(rgbMatch[2])
              );
              previewDiv.textContent = `${color}\n${hexColor}`;
          };

          // Click event to select color
          const clickHandler = (e) => {
              if (!isPickerActive) return;

              const color = getColorAtPixel(e);
              
              // Send color back to popup
              sendResponse({color: color});

              // Clean up
              document.removeEventListener('mousemove', mouseMoveHandler);
              document.removeEventListener('click', clickHandler);
              removeColorPickerOverlay();
              document.body.removeChild(previewDiv);
          };

          // Add event listeners
          document.addEventListener('mousemove', mouseMoveHandler);
          document.addEventListener('click', clickHandler, {once: true});

          // Escape key to cancel
          const escapeHandler = (e) => {
              if (e.key === 'Escape') {
                  document.removeEventListener('mousemove', mouseMoveHandler);
                  document.removeEventListener('click', clickHandler);
                  document.removeEventListener('keydown', escapeHandler);
                  removeColorPickerOverlay();
                  document.body.removeChild(previewDiv);
                  sendResponse({canceled: true});
              }
          };
          document.addEventListener('keydown', escapeHandler);

          return true;  // Required for async sendResponse
      }
  });

  // Function to get color at pixel
  function getColorAtPixel(event) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Capture screen
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.drawWindow(window, 0, 0, canvas.width, canvas.height, 'rgb(255,255,255)');

      // Get pixel color
      const pixel = ctx.getImageData(event.clientX, event.clientY, 1, 1).data;
      return `RGB(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  }

  // Utility function to convert RGB to HEX
  function rgbToHex(r, g, b) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
})();
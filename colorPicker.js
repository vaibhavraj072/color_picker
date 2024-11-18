// Create eyedropper cursor
const eyedropperCursor = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path fill="white" stroke="black" d="M16.98 0c-.96 0-1.92.37-2.65 1.1L12 3.43l-.48-.48a.993.993 0 0 0-1.41 0c-.39.39-.39 1.02 0 1.41l.48.48-8.29 8.29c-.39.39-.39 1.02 0 1.41l4.24 4.24c.39.39 1.02.39 1.41 0l8.29-8.29.48.48c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-.48-.48 2.33-2.33c1.46-1.46 1.46-3.83 0-5.29-1.46-1.46-3.83-1.46-5.29 0z"/>
</svg>`;

let screenCaptureStream = null;

// Create overlay for color picking
const overlay = document.createElement('div');
overlay.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999999;
  cursor: url('${eyedropperCursor}') 0 24, crosshair;
`;

// Create preview box that follows cursor
const previewBox = document.createElement('div');
previewBox.style.cssText = `
  position: fixed;
  width: 150px;
  height: 80px;
  background: white;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 10px;
  font-family: monospace;
  pointer-events: none;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;

// Color preview elements
const colorSwatch = document.createElement('div');
colorSwatch.style.cssText = `
  width: 100%;
  height: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const rgbText = document.createElement('div');
rgbText.style.cssText = `
  font-size: 12px;
  color: black;
`;

const hexText = document.createElement('div');
hexText.style.cssText = `
  font-size: 12px;
  color: black;
`;

previewBox.appendChild(colorSwatch);
previewBox.appendChild(rgbText);
previewBox.appendChild(hexText);

// Function to get color at point
async function getColorAtPoint(x, y) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 1;
  canvas.height = 1;

  // Use video frame if we have screen capture
  if (screenCaptureStream) {
    const videoTrack = screenCaptureStream.getVideoTracks()[0];
    const videoSettings = videoTrack.getSettings();
    
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = videoSettings.width;
    captureCanvas.height = videoSettings.height;
    const captureContext = captureCanvas.getContext('2d');
    
    const video = document.createElement('video');
    video.srcObject = screenCaptureStream;
    video.play();
    
    await new Promise(resolve => video.addEventListener('play', resolve));
    captureContext.drawImage(video, 0, 0);
    
    const imageData = captureContext.getImageData(x, y, 1, 1).data;
    return {
      r: imageData[0],
      g: imageData[1],
      b: imageData[2]
    };
  }
  
  // Fallback to window capture
  try {
    context.drawWindow(window, x, y, 1, 1, 'rgb(255,255,255)');
    const imageData = context.getImageData(0, 0, 1, 1).data;
    return {
      r: imageData[0],
      g: imageData[1],
      b: imageData[2]
    };
  } catch (error) {
    console.error('Error capturing color:', error);
    return { r: 0, g: 0, b: 0 };
  }
}

// Function to convert RGB to HEX
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

// Function to update preview box
async function updatePreview(e) {
  const color = await getColorAtPoint(e.clientX, e.clientY);
  const { r, g, b } = color;
  const hex = rgbToHex(r, g, b);
  
  // Update preview box
  colorSwatch.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  rgbText.textContent = `RGB(${r}, ${g}, ${b})`;
  hexText.textContent = hex;
  
  // Position preview box
  previewBox.style.left = `${e.clientX + 20}px`;
  previewBox.style.top = `${e.clientY + 20}px`;
  
  // Send color to popup for real-time update
  chrome.runtime.sendMessage({
    type: 'preview-update',
    color: {
      r: r,
      g: g,
      b: b,
      hex: hex
    }
  });
}

// Initialize color picker
async function initColorPicker() {
  try {
    // Request screen capture
    screenCaptureStream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: "never" },
      audio: false
    });
    
    // Add elements to page
    document.body.appendChild(overlay);
    document.body.appendChild(previewBox);
    
    // Add event listeners
    document.addEventListener('mousemove', updatePreview);
    document.addEventListener('click', async (e) => {
      e.preventDefault();
      const color = await getColorAtPoint(e.clientX, e.clientY);
      
      // Send final color selection
      chrome.runtime.sendMessage({
        type: 'color-selected',
        color: {
          r: color.r,
          g: color.g,
          b: color.b,
          hex: rgbToHex(color.r, color.g, color.b)
        }
      });
      
      // Cleanup
      cleanup();
    });
  } catch (error) {
    console.error('Error initializing color picker:', error);
    chrome.runtime.sendMessage({ type: 'picker-error' });
  }
}

// Cleanup function
function cleanup() {
  if (screenCaptureStream) {
    screenCaptureStream.getTracks().forEach(track => track.stop());
  }
  document.body.removeChild(overlay);
  document.body.removeChild(previewBox);
  document.removeEventListener('mousemove', updatePreview);
}

// Start color picker
initColorPicker();
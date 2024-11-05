document.addEventListener('mousemove', (event) => {
    const color = getPixelColor(event.clientX, event.clientY);
    chrome.runtime.sendMessage({ action: 'updateSelectedColor', color });
  });
  
  function getPixelColor(x, y) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(document, x, y, 1, 1, 0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return { r, g, b };
  }
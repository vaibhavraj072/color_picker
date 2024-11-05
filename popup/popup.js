document.addEventListener('DOMContentLoaded', () => {
    const selectedColor = document.querySelector('.selected-color');
    const rgbValue = document.querySelector('.rgb-value');
    const hexValue = document.querySelector('.hex-value');
    const hslValue = document.querySelector('.hsl-value');
    const copyRgbBtn = document.querySelector('.copy-rgb');
    const copyHexBtn = document.querySelector('.copy-hex');
    const copyAllBtn = document.querySelector('.copy-all');
  
    chrome.runtime.sendMessage({ action: 'getSelectedColor' }, (response) => {
      const { r, g, b } = response.color;
      selectedColor.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      rgbValue.textContent = `RGB: ${r}, ${g}, ${b}`;
      hexValue.textContent = `Hex: ${rgbToHex(r, g, b)}`;
      hslValue.textContent = `HSL: ${rgbToHsl(r, g, b)}`;
    });
  
    copyRgbBtn.addEventListener('click', () => {
      copyToClipboard(rgbValue.textContent.split(': ')[1]);
    });
  
    copyHexBtn.addEventListener('click', () => {
      copyToClipboard(hexValue.textContent.split(': ')[1]);
    });
  
    copyAllBtn.addEventListener('click', () => {
      const allValues = `${rgbValue.textContent.split(': ')[1]}, ${hexValue.textContent.split(': ')[1]}, ${hslValue.textContent.split(': ')[1]}`;
      copyToClipboard(allValues);
    });
  
    function rgbToHex(r, g, b) {
      return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
  
    function rgbToHsl(r, g, b) {
      r /= 255, g /= 255, b /= 255;
      let max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
  
      if (max == min) {
        h = s = 0; // achromatic
      } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
  
      return `${(h * 360).toFixed(1)}, ${(s * 100).toFixed(1)}%, ${(l * 100).toFixed(1)}%`;
    }
  
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text);
    }
  });
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelectedColor') {
      sendResponse({ color: selectedColor });
    } else if (request.action === 'updateSelectedColor') {
      selectedColor = request.color;
    }
  });
  
  let selectedColor = { r: 0, g: 0, b: 0 };
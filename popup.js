document.addEventListener('DOMContentLoaded', () => {
    const popupHeader = document.getElementById('popup-header');
    const closeBtn = document.getElementById('close-btn');
    const pickButton = document.getElementById('pick-button');
    const colorPreview = document.getElementById('color-preview');
    const rgbValue = document.getElementById('rgb-value');
    const hexValue = document.getElementById('hex-value');

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    // Drag functionality
    popupHeader.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === popupHeader) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, document.body);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;

        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    // Close button
    closeBtn.addEventListener('click', () => {
        window.close();
    });

    // Pick color button
    pickButton.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: "pickColor"}, (response) => {
                if (response && response.color) {
                    // Update color preview and values
                    colorPreview.style.backgroundColor = response.color;
                    rgbValue.textContent = response.color;
                    
                    // Convert to HEX
                    const rgbMatch = response.color.match(/\d+/g);
                    const hexColor = rgbToHex(
                        parseInt(rgbMatch[0]), 
                        parseInt(rgbMatch[1]), 
                        parseInt(rgbMatch[2])
                    );
                    hexValue.textContent = hexColor;
                }
            });
        });
    });

    // RGB to HEX conversion
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
});
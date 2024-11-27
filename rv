(function() {
    // SVG for dropper cursor
    const dropperSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" 
             style="position: absolute; pointer-events: none; z-index: 9999;">
            <path fill="none" stroke="black" stroke-width="2" 
                  d="M12 3v7m0 0v7m0-7h7m-7 0H5m7-7a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
        </svg>
    `;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "Pick Color") {
            // Create custom cursor
            const cursorElement = document.createElement('div');
            cursorElement.innerHTML = dropperSVG;
            cursorElement.style.position = 'fixed';
            cursorElement.style.pointerEvents = 'none';
            cursorElement.style.zIndex = '9999';
            document.body.appendChild(cursorElement);

            // Temporary preview div
            const previewDiv = document.createElement('div');
            previewDiv.style.position = 'fixed';
            previewDiv.style.width = '100px';
            previewDiv.style.height = '100px';
            previewDiv.style.border = '2px solid white';
            previewDiv.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
            previewDiv.style.zIndex = '9998';
            previewDiv.style.pointerEvents = 'none';
            document.body.appendChild(previewDiv);

            // Hide default cursor
            document.body.style.cursor = 'none';

            // Mouse move handler
            const mouseMoveHandler = (e) => {
                // Move SVG cursor
                cursorElement.style.left = `${e.clientX}px`;
                cursorElement.style.top = `${e.clientY}px`;

                // Move preview div
                previewDiv.style.left = `${e.clientX - 50}px`;
                previewDiv.style.top = `${e.clientY - 50}px`;
                
                const color = getColorAtPixel(e);
                previewDiv.style.backgroundColor = color;
            };

            // Click handler
            const clickHandler = (e) => {
                const color = getColorAtPixel(e);
                
                // Send color back to popup
                sendResponse({color: color});

                // Clean up
                document.body.style.cursor = 'default';
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('click', clickHandler);
                document.body.removeChild(cursorElement);
                document.body.removeChild(previewDiv);
            };

            // Escape key to cancel
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    document.body.style.cursor = 'default';
                    document.removeEventListener('mousemove', mouseMoveHandler);
                    document.removeEventListener('click', clickHandler);
                    document.removeEventListener('keydown', escapeHandler);
                    document.body.removeChild(cursorElement);
                    document.body.removeChild(previewDiv);
                    sendResponse({canceled: true});
                }
            };

            // Add event listeners
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('click', clickHandler, {once: true});
            document.addEventListener('keydown', escapeHandler);

            return true;
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
})();
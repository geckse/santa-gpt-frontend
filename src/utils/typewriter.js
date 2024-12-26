import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

export function typeText(element, text, speed = 5) {
    return new Promise(resolve => {
        element.classList.add('typing');
        let i = 0;
        element.textContent = '';
        let renderedText = "";
        
        function type() {
            if (i < text.length) {
                renderedText += text.charAt(i);
                element.innerHTML = marked.parse(renderedText);
                i++;
                // Random delay between 0.5x and 1.5x of base speed
                const randomDelay = speed * (0.5 + Math.random()*3);
                setTimeout(type, speed);
            } else {
                element.classList.remove('typing');
                resolve();
            }
        }
        
        type();
    });
}
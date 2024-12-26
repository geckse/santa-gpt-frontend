import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

import { initSnow, initSnowInBall } from './src/snow.js';
import { getRandomLoadingMessage } from './src/loadingMessages.js';
import { initializeChatUI } from './src/chatUI.js';
import { typeText } from './src/utils/typewriter.js';

const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const saveButton = document.getElementById('saveButton');
const chatContainer = document.querySelector('.chat-container');
const chatUI = initializeChatUI();


var isRoasted = false;
var roastUrl = window.roastUrl ? window.roastUrl : window.location.href;
var verdict = window.verdict ? window.verdict : "";
const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Initialize snow effect
initSnow();
initSnowInBall();


// Add initial Santa greeting
window.addEventListener('DOMContentLoaded', async () => {
   // when body is loaded, check if there is a detail page
   if(document.body.classList.contains('detail-page')) {
    if(chatUI) chatUI.showMessages();
    addSocialButtons(document.querySelector('.message'), roastUrl, verdict);

    // render the roast message inner as markdown
    let unrenderedRoast = document.querySelector('.message-inner').innerHTML;
    document.querySelector('.message-inner').innerHTML = marked(unrenderedRoast);


    setTimeout(() => {
        document.querySelector('.verdict-text').classList.add('active');
    }, 700);    
   }
   if(document.body.classList.contains('show-verdict-onload')) {
    setTimeout(() => {
        document.querySelector('.verdict-text').classList.add('active');
    }, 700);    
   }
});


function addMessage(text, sender, isRoast, data) {
    if(chatUI) chatUI.showMessages();

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    const messageInner = document.createElement('div');
    messageInner.classList.add('message-inner');
    messageDiv.appendChild(messageInner);

    if (sender === 'user') {
        messageInner.textContent = text;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if(isRoast) {
        messageDiv.classList.add('roast-message');

        console.log("data", data);
        addSocialButtons(messageDiv, data.roastUrl, verdict);

        try {
            // change location to the roast url without navigation
            window.history.pushState({}, '', data.roastUrl);
        } catch (error) {
            console.log("No Push State");
            console.error(error);
        }
    }
    
    return messageInner;
}

function addSocialButtons(container, url, verdict) {

        // below container add a div with class "roast-container"
        const messageToolbar = document.createElement('div');
        messageToolbar.classList.add('message-toolbar');

        const firstRow = document.createElement('div');
        firstRow.classList.add('message-toolbar-row');
        messageToolbar.appendChild(firstRow);

        const secondRow = document.createElement('div');
        secondRow.classList.add('message-toolbar-row');
        secondRow.classList.add('second-row');

        messageToolbar.appendChild(secondRow);
        // add links for sharing
        const shareLink = document.createElement('a');
        shareLink.href = `https://x.com/intent/tweet?text=Ich bin auf der ${verdict} Liste! 🎅🎄&url=`+url;
        shareLink.target = '_blank';
        shareLink.innerHTML = '<i data-feather="twitter"></i> Share on X';
        shareLink.classList.add('share-link');
        firstRow.appendChild(shareLink);

        // add a linkedin share button
        const linkedinShareButton = document.createElement('a');
        linkedinShareButton.href = `https://www.linkedin.com/sharing/share-offsite/?url=`+url;
        linkedinShareButton.target = '_blank';
        linkedinShareButton.innerHTML = '<i data-feather="linkedin"></i> Share on LinkedIn';
        linkedinShareButton.classList.add('linkedin-share-button');
        firstRow.appendChild(linkedinShareButton);

        // add a plain link to the roast url
        const imageLink = document.createElement('a');
        var imageDownloadUrl = url;
        imageDownloadUrl = imageDownloadUrl.replace('https://santa-gpt.de/roast/', 'https://santa-gpt.de/images/cards/')+'.png';
        imageLink.href = imageDownloadUrl;
        imageLink.target = '_blank';
        imageLink.innerHTML = '<i data-feather="image"></i> Download Image';
        imageLink.classList.add('roast-img-link');
        firstRow.appendChild(imageLink);

        // add a plain link to the roast url
        const roastLink = document.createElement('a');
        roastLink.href = url;
        roastLink.target = '_blank';
        roastLink.innerHTML = '<i data-feather="link"></i> Copy Link';
        roastLink.classList.add('roast-link');
        secondRow.appendChild(roastLink);

        container.appendChild(messageToolbar);

        feather.replace();
  
}

let loadingInterval;

function updateLoadingMessage(loadingDiv) {
    loadingDiv.textContent = getRandomLoadingMessage();
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Disable send button
    sendButton.disabled = true;
    sendButton.classList.add('disabled');

    // Add user message
    addMessage(message, 'user', false, null);
    messageInput.value = '';

    // Show loading indicator with changing messages
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('loading');
    updateLoadingMessage(loadingDiv);
    messagesContainer.appendChild(loadingDiv);

    // Start changing loading message every 2 seconds
    loadingInterval = setInterval(() => updateLoadingMessage(loadingDiv), 2000);

    try {
        // Simulate API call (replace with your actual backend endpoint)
        const response = await fetch('https://santa-gpt.de/sendMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                sessionId: sessionId
             })
        });

        if (!response.ok) throw new Error('Failed to get response');
        
        const data = await response.json();
        
        // Clear interval and remove loading indicator
        clearInterval(loadingInterval);
        loadingDiv.remove();

        if(data.isRoasted) {
            isRoasted = true;
            if(data.verdict.toUpperCase() === "NICE") {
                verdict = "Nice";
                document.querySelector('.snow-ball-wrapp').classList.remove('naughty');
                document.querySelector('.snow-ball-wrapp').classList.remove('nice');
                document.querySelector('.verdict-text').classList.remove('active');
                document.querySelector('.verdict-text h2').textContent = "Nice";
                setTimeout(() => {
                    document.querySelector('.snow-ball-wrapp').classList.add('nice');
                    document.querySelector('.verdict-text').classList.add('active');
                }, 700);
            } else if(data.verdict.toUpperCase() === "NAUGHTY") {
                verdict = "Naughty";
                document.querySelector('.snow-ball-wrapp').classList.remove('naughty');
                document.querySelector('.snow-ball-wrapp').classList.remove('nice');
                document.querySelector('.verdict-text').classList.remove('active');
                document.querySelector('.verdict-text h2').textContent = "Naughty";
                setTimeout(() => {
                    document.querySelector('.snow-ball-wrapp').classList.add('naughty');
                    document.querySelector('.verdict-text').classList.add('active');
                }, 700);
            }
        }
        
        // Add Santa's response with typing effect
        const santaMessageDiv = addMessage('', 'santa', data.isRoasted, data);
        await typeText(santaMessageDiv, data.fullMessage);
    } catch (error) {
        // Clear interval and remove loading indicator
        clearInterval(loadingInterval);
        loadingDiv.remove();
        
        // show in console the error
        console.error(error);

        // Add error message with typing effect
        const errorMessageDiv = addMessage('', 'santa');
        await typeText(errorMessageDiv, "Oh nein! Da ist wohl etwas schief gelaufen. Anscheinend sind meine fleißigen KI-Elfen nicht mehr so fleißig. Bitte versuche es später erneut!");
    } finally {
        // Re-enable send button
        sendButton.disabled = false;
        sendButton.classList.remove('disabled');
    }
}

// Event listeners
if(sendButton) sendButton.addEventListener('click', sendMessage);
if(messageInput) messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent default newline
        sendMessage();
    }
});

const textarea = document.getElementById('messageInput');
if(textarea) textarea.addEventListener('input', function() {
    this.style.height = '1.5em';
    const maxHeight = 9; // 6 lines x 1.5em
    this.style.height = Math.min(maxHeight, this.scrollHeight) + 'px';
});

document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
        const accordionContent = button.nextElementSibling;
        const icon = button.querySelector('.accordion-icon');
        
        button.classList.toggle('active');
        icon.classList.toggle('active');
        
        if (accordionContent.style.maxHeight) {
            accordionContent.style.maxHeight = null;
            accordionContent.classList.remove('active');
        } else {
            accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
            accordionContent.classList.add('active');
        }
    });
});
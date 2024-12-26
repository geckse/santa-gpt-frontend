export function initializeChatUI() {
    const messagesContainer = document.getElementById('messages');
    if(!messagesContainer) {
        return;
    }
    messagesContainer.style.display = 'none'; // Initially hide messages container
    
    return {
        showMessages: () => {
            if(!messagesContainer) {
                return;
            }
            messagesContainer.style.display = 'block';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        },
        hideMessages: () => {
            if(!messagesContainer) {
                return;
            }
            messagesContainer.style.display = 'none';
        }
    };
}
// script.js

// Backend API URL (Change this if your FastAPI is running on different port or host)
const API_URL = 'http://127.0.0.1:8000/ask';

const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// Add a message to the chat
function addMessage(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;

    const bubbleClass = isUser ? 'user-bubble' : 'bot-bubble';
    
    messageDiv.innerHTML = `
        <div class="message-bubble ${bubbleClass}">
            ${content}
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'flex justify-start';
    typingDiv.innerHTML = `
        <div class="message-bubble bot-bubble typing">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return typingDiv;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
}

// Welcome Message
function showWelcomeMessage() {
    chatContainer.innerHTML = `
        <div class="flex justify-center py-8">
            <div class="text-center max-w-md">
                <div class="mx-auto w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-5xl mb-6">
                    🥗
                </div>
                <h2 class="text-2xl font-semibold text-gray-800 mb-3 title-font">Welcome to NutriResearch</h2>
                <p class="text-gray-600 leading-relaxed">
                    Your intelligent assistant for human nutrition research.<br>
                    Ask me anything based on the <strong>Human Nutrition Textbook</strong>.
                </p>
            </div>
        </div>
    `;
}

// Send message to backend
async function sendMessage(query) {
    if (!query || query.trim() === '') return;

    // Add user message
    addMessage(query, true);
    userInput.value = '';

    // Show typing
    const typingIndicator = showTypingIndicator();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query })
        });

        removeTypingIndicator();

        const data = await response.json();

        if (response.ok) {
            addMessage(data.answer || data.response || "Sorry, I couldn't generate a response.", false);
        } else {
            addMessage("⚠️ Server error. Please try again later.", false);
        }
    } catch (error) {
        removeTypingIndicator();
        addMessage("⚠️ Cannot connect to the server. Make sure FastAPI is running.", false);
        console.error('Error:', error);
    }
}

// Clear entire chat
function clearChat() {
    if (confirm("Clear the entire conversation?")) {
        chatContainer.innerHTML = '';
        showWelcomeMessage();
    }
}

// Event Listeners
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(userInput.value);
});

// Send message on Enter key (without Shift)
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(userInput.value);
    }
});

// Initialize the app
function init() {
    showWelcomeMessage();

    // Add example suggestion buttons after a short delay
    setTimeout(() => {
        const examplesDiv = document.createElement('div');
        examplesDiv.className = "flex flex-wrap gap-2 justify-center mt-6";
        examplesDiv.innerHTML = `
            <button onclick="sendMessage('Is intermittent fasting effective for weight loss?')" 
                    class="px-5 py-2.5 text-sm bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl transition-colors">
                Intermittent Fasting
            </button>
            <button onclick="sendMessage('What are the benefits of omega-3 fatty acids?')" 
                    class="px-5 py-2.5 text-sm bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl transition-colors">
                Omega-3 Benefits
            </button>
            <button onclick="sendMessage('How much protein should I eat daily?')" 
                    class="px-5 py-2.5 text-sm bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl transition-colors">
                Daily Protein Intake
            </button>
        `;
        chatContainer.appendChild(examplesDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 600);
}

// Start the application
window.onload = init;
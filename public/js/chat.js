// Configuration du chat
const config = {
    apiUrl: '/api/chat', // À remplacer par l'URL de votre API
    typingDelay: 1000, // Délai d'attente avant d'afficher le message de l'assistant (en ms)
    userAvatar: '👤',
    botAvatar: '🤖',
};

// État du chat
let isChatOpen = false;

// Éléments du DOM
let chatContainer, chatMessages, chatInput, sendButton, quickActions, floatingChatBtn;

// Stocke les derniers messages utilisateur pour l'ajout comme description de symptômes
let lastUserMessages = [];

// Initialisation du chat
function initChat() {
    // Création de l'interface du chat
    chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';
    
    // En-tête du chat
    const chatHeader = document.createElement('div');
    chatHeader.className = 'chat-header';
    chatHeader.innerHTML = `
        <div class="chat-title">
            <div class="chat-avatar">${config.botAvatar}</div>
            <span>LotusCare Assistant</span>
        </div>
        <button id="closeChat" class="chat-close">×</button>
    `;
    
    // Zone des messages
    chatMessages = document.createElement('div');
    chatMessages.className = 'chat-messages';
    
    // Zone de saisie
    const inputContainer = document.createElement('div');
    inputContainer.className = 'chat-input-container';
    
    // Actions rapides
    quickActions = document.createElement('div');
    quickActions.className = 'quick-actions';
    updateQuickActions();
    
    // Champ de saisie
    chatInput = document.createElement('input');
    chatInput.type = 'text';
    chatInput.placeholder = 'Type your message...';
    chatInput.className = 'chat-input';
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && chatInput.value.trim() !== '') {
            sendMessage(chatInput.value);
        }
    });
    
    // Bouton d'envoi
    sendButton = document.createElement('button');
    sendButton.className = 'send-button';
    sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
    sendButton.addEventListener('click', () => {
        if (chatInput.value.trim() !== '') {
            sendMessage(chatInput.value);
        }
    });
    
    // Assemblage des éléments
    inputContainer.appendChild(chatInput);
    inputContainer.appendChild(sendButton);
    
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(chatMessages);
    chatContainer.appendChild(quickActions);
    chatContainer.appendChild(inputContainer);
    
    // Ajout du chat au body
    document.body.appendChild(chatContainer);
    
    // Récupérer le bouton flottant
    floatingChatBtn = document.getElementById('floatingChatBtn');
    
    // Gestionnaires d'événements
    document.getElementById('closeChat').addEventListener('click', toggleChat);
    document.getElementById('startChat').addEventListener('click', toggleChat);
    floatingChatBtn.addEventListener('click', toggleChat);
    
    // Désactiver le chat au démarrage
    chatContainer.style.opacity = '0';
    chatContainer.style.visibility = 'hidden';
    
    // Message de bienvenue
    setTimeout(() => {
        addBotMessage('Hello! I am LotusCare, your medical assistant. How can I help you today?');
    }, 300);
}

// Mettre à jour les actions rapides
function updateQuickActions() {
    const actions = [
        { text: 'Book Appointment', icon: 'calendar-check' },
        { text: 'My Medications', icon: 'pills' },
        { text: 'My Symptoms', icon: 'stethoscope' },
        { text: 'Contact Doctor', icon: 'user-md' }
    ];
    
    quickActions.innerHTML = actions.map(action => `
        <button class="quick-action" data-text="${action.text}">
            <i class="fas fa-${action.icon}"></i>
            <span>${action.text}</span>
        </button>
    `).join('');
    
    // Ajouter les gestionnaires d'événements pour les actions rapides
    document.querySelectorAll('.quick-action').forEach(button => {
        button.addEventListener('click', (e) => {
            const text = e.currentTarget.getAttribute('data-text');
            sendMessage(text);
        });
    });
}

// Ajouter un message de l'utilisateur
function addUserMessage(text) {
    lastUserMessages.push(text);
    if (lastUserMessages.length > 5) lastUserMessages.shift(); // Garde les 5 derniers messages

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = config.userAvatar;
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Vider le champ de saisie
    chatInput.value = '';
    chatInput.focus();
}

// Ajouter un message du bot
function addBotMessage(text) {
    // Créer le conteneur du message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    
    // Créer l'avatar
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = config.botAvatar;
    
    // Créer le contenu du message
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Ajouter le texte au contenu
    content.textContent = text;
    
    // Assembler le message
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    // Ajouter le message à la zone de discussion
    chatMessages.appendChild(messageDiv);
    
    // Faire défiler vers le bas
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Afficher l'indicateur de frappe
function showTypingIndicator() {
    // Supprimer l'indicateur existant s'il y en a un
    const existingIndicator = document.querySelector('.typing-indicator');
    if (existingIndicator) existingIndicator.remove();
    
    // Créer le conteneur du message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message typing';
    
    // Créer l'avatar
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = config.botAvatar;
    
    // Créer le conteneur des points
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    
    // Assembler le message
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(indicator);
    
    // Ajouter à la zone de discussion
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return indicator;
}

// Cacher l'indicateur de frappe
function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.closest('.message').remove();
    }
}

// Basculer l'affichage du chat
function toggleChat() {
    isChatOpen = !isChatOpen;
    
    if (isChatOpen) {
        chatContainer.style.opacity = '1';
        chatContainer.style.visibility = 'visible';
        chatContainer.style.transform = 'translateY(0)';
        floatingChatBtn.style.transform = 'scale(0)';
        setTimeout(() => {
            floatingChatBtn.style.display = 'none';
            chatInput.focus();
        }, 200);
    } else {
        chatContainer.style.opacity = '0';
        chatContainer.style.visibility = 'hidden';
        chatContainer.style.transform = 'translateY(20px)';
        floatingChatBtn.style.display = 'flex';
        setTimeout(() => {
            floatingChatBtn.style.transform = 'scale(1)';
        }, 50);
    }
}

// Fonction pour créer un rendez-vous dans Google Calendar
async function bookAppointment(patient_name, appointment_time, displayDate, symptoms) {
    console.log('[LotusCare] Sending booking request:', { patient_name, appointment_time, symptoms });
    console.log('[LotusCare] Sending booking request:', { patient_name, appointment_time });
    try {
        const response = await fetch('/lotuscare/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patient_name, appointment_time, symptoms })
        });
        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.log('[LotusCare] Error parsing JSON response:', e);
            addBotMessage('Error: Invalid response from server.');
            return;
        }
        console.log('[LotusCare] Booking response:', data);
        if (data.success) {
            // Affiche la date/heure réservée au format lisible
            let dateStr = displayDate || new Date(appointment_time).toLocaleString();
            addBotMessage('Appointment booked for ' + dateStr + ' successfully! 📅');
        } else {
            addBotMessage('Failed to book appointment: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.log('[LotusCare] Error during booking fetch:', error);
        addBotMessage('Error while booking appointment.');
    }
}

// Envoyer un message
async function sendMessage(text) {
    // Ajouter le message de l'utilisateur
    addUserMessage(text);

    // Si c'est une demande de rendez-vous, saute l'IA et va direct à la réservation
    if (/\b(appointment|book appointment)\b/i.test(text)) {
        showTypingIndicator();
        hideTypingIndicator();
        const now = new Date();
        const patient_name = 'User';
        // Concatène les derniers messages utilisateur comme symptômes
        const symptoms = lastUserMessages.join(' ');
        await bookAppointment(patient_name, now.toISOString(), now.toLocaleString(), symptoms);
        return;
    }

    // Sinon, toujours interroger l'IA
    showTypingIndicator();
    try {
        // Détection d'intention simple
        let systemPrompt = "You are LotusCare, a friendly and professional medical assistant. Your role is to help patients with:\n- Booking and managing appointments\n- Setting medication reminders\n- Answering questions about medical records and visits\n\nGuidelines:\n- Be empathetic and patient\n- Use clear, simple language\n- Maintain strict patient confidentiality\n- Always verify critical information\n- Provide concise, relevant responses";
        // Si symptômes détectés, on peut spécialiser le prompt
        if (/headache|fever|pain|cough|sick|unwell|throat|tired|nausea|vomit|flu|cold|dizzy|fatigue|stomach|chills|symptom|malade|fièvre|tête|gorge|toux|fatigu/i.test(text)) {
            systemPrompt = "You are LotusCare, a friendly and professional medical assistant. The user is describing symptoms. Do not give any medical advice or suggestions. Simply acknowledge or restate the user's symptoms in one sentence, then always ask: 'Would you like to book a medical appointment?'";
        }
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: text }],
                systemPrompt,
                temperature: 0.3,
                max_tokens: 200
            })
        });
        const data = await response.json();
        hideTypingIndicator();

        if (data && data.choices && data.choices[0] && data.choices[0].message) {
            const msg = data.choices[0].message;
            if (msg.content) {
                addBotMessage(msg.content);
            } else if (msg.reasoning_content) {
                addBotMessage(msg.reasoning_content);
            } else {
                // Détection automatique des symptômes dans le message utilisateur
                if (/headache|fever|pain|cough|sick|unwell|throat|tired|nausea|vomit|flu|cold|dizzy|fatigue|stomach|chills|symptom|malade|fièvre|tête|gorge|toux|fatigu/i.test(text)) {
                    addBotMessage("Thank you for describing your symptoms. Would you like to book a medical appointment?");
                } else {
                    addBotMessage("I'm here to help. Could you please describe your symptoms or ask your question in another way?");
                }
            }
        } else if (data && data.error) {
            addBotMessage("Sorry, an error occurred: " + (data.error.message || data.error));
        } else {
            // fallback
            addBotMessage("I'm here to help. Could you please describe your symptoms or ask your question in another way?");
        }
    } catch (error) {
        console.error("Error sending message:", error);
        hideTypingIndicator();
        addBotMessage("Sorry, an error occurred. Please try again later.");
    }
}


// Initialisation lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    // Créer le bouton flottant s'il n'existe pas
    if (!document.getElementById('floatingChatBtn')) {
        const btn = document.createElement('button');
        btn.id = 'floatingChatBtn';
        btn.className = 'floating-chat-btn';
        btn.innerHTML = '<i class="fas fa-comment-medical"></i>';
        btn.setAttribute('aria-label', 'Open chat');
        document.body.appendChild(btn);
    }
    
    // Initialiser le chat
    initChat();
    
    // Gestionnaire pour le bouton de démarrage
    const startBtn = document.getElementById('startChat');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!isChatOpen) toggleChat();
        });
    }
});

document.getElementById('send_button').addEventListener('click', function() {
    sendMessage();
});

document.getElementById('user_input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Ses butonuna tıklandığında sesli giriş başlat
document.getElementById('voice_button').addEventListener('click', function() {
    startVoiceRecognition('user_input');
});

// Sesli Not butonuna tıklandığında sesli not al
document.getElementById('voice_note_button').addEventListener('click', function() {
    startVoiceRecognition('notes');
});

// Notları PDF olarak kaydetme işlevi
document.getElementById('save_pdf_button').addEventListener('click', function() {
    const noteText = document.getElementById("notes").value.trim();

    if (noteText) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text(noteText, 10, 10);
        
        // PDF'i yeni bir sekmede aç
        window.open(doc.output('bloburl'), '_blank');
    } else {
        alert("Kaydetmek için önce not ekleyin.");
    }
});

// Sesli giriş başlatma işlevi
function startVoiceRecognition(targetElementId) {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'tr-TR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById(targetElementId).value += transcript;
        };

        recognition.onerror = function(event) {
            console.error("Hata oluştu: ", event.error);
        };
    } else {
        alert("Tarayıcınız sesli giriş özelliğini desteklemiyor.");
    }
}

// Metinden sese çevirme işlevi (emojileri filtreleyip sayıları korur)
function speak(text) {
    if ('speechSynthesis' in window) {
        const textWithoutEmojis = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
        
        const utterance = new SpeechSynthesisUtterance(textWithoutEmojis);
        utterance.lang = 'tr-TR';
        speechSynthesis.speak(utterance);
    } else {
        alert("Tarayıcınız metin okuma özelliğini desteklemiyor.");
    }
}

// Mesaj gönderme işlevi
function sendMessage() {
    var userInputField = document.getElementById('user_input');
    var userInput = userInputField.value;
    if (userInput.trim() === "") return;

    var chatbox = document.getElementById('chatbox');
    var userMessage = document.createElement('p');
    userMessage.classList.add('user-message');
    userMessage.innerHTML = `<strong>Sen:</strong> ${userInput}`;
    chatbox.appendChild(userMessage);

    var typingIndicator = document.createElement('p');
    typingIndicator.classList.add('typing-indicator');
    typingIndicator.innerHTML = 'yazıyor...';
    chatbox.appendChild(typingIndicator);

    chatbox.scrollTop = chatbox.scrollHeight;

    fetch('/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: userInput })
    })
    .then(response => response.json())
    .then(data => {
        chatbox.removeChild(typingIndicator);

        var botMessageContainer = document.createElement('div');
        botMessageContainer.classList.add('bot-message-container');

        var botMessage = document.createElement('p');
        botMessage.classList.add('bot-message');
        botMessage.innerHTML = `<strong>Bot:</strong> ${data.bot_response}`;
        botMessageContainer.appendChild(botMessage);

        // Play butonu
        var playButton = document.createElement('button');
        playButton.classList.add('button', 'is-info', 'play-audio');
        playButton.innerHTML = `<i class="fas fa-volume-up"></i>`;
        playButton.addEventListener('click', function() {
            speak(data.bot_response);
        });
        botMessageContainer.appendChild(playButton);

        // Stop butonu
        var stopButton = document.createElement('button');
        stopButton.classList.add('button', 'is-warning', 'stop-audio');
        stopButton.innerHTML = `<i class="fas fa-volume-mute"></i>`;
        stopButton.addEventListener('click', function() {
            speechSynthesis.cancel();
        });
        botMessageContainer.appendChild(stopButton);

        chatbox.appendChild(botMessageContainer);
        chatbox.scrollTop = chatbox.scrollHeight;
    })
    .catch(error => {
        console.error('Error:', error);
        chatbox.removeChild(typingIndicator);
    });

    userInputField.value = "";
}
document.addEventListener("DOMContentLoaded", function () {
    const chatbotTab = document.getElementById("chatbot-tab");
    const gameTab = document.getElementById("game-tab");
    const storyTab = document.getElementById("story-tab");

    const chatbotContent = document.getElementById("chatbot-content");
    const gameContent = document.getElementById("game-content");
    const storyContent = document.getElementById("story-content");

    chatbotTab.addEventListener("click", () => activateTab("chatbot"));
    gameTab.addEventListener("click", () => activateTab("game"));
    storyTab.addEventListener("click", () => activateTab("story"));

    function activateTab(tabName) {
        document.querySelectorAll(".navbar-item.is-tab").forEach(tab => tab.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(content => content.style.display = "none");

        if (tabName === "chatbot") {
            chatbotTab.classList.add("active");
            chatbotContent.style.display = "block";
        } else if (tabName === "game") {
            gameTab.classList.add("active");
            gameContent.style.display = "block";
        } else if (tabName === "story") {
            storyTab.classList.add("active");
            storyContent.style.display = "block";
        }
    }

    activateTab("chatbot"); // İlk açılışta chatbot sekmesini aktif yapar
});

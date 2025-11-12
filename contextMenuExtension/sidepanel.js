document.addEventListener('DOMContentLoaded', () => {
  const chatContainer = document.getElementById('chat-container');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button-icon');
  const loadingSvg = document.getElementById('loading-svg');

  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom
  }

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "openSidePanel" && message.content) {
            chatInput.value = message.content;
    }
  });

  function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
      addMessage(message, "user");
      chatInput.value = '';
      // Send the message to the chatbot API
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        "model_name": "gemini",
        "user_message": message, // Use the actual user message
        "session_id": "1234", // Placeholder for session ID
        "isRetry": "false",
        "images": []
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      fetch("https://proxy2.weevisit.com/v1/apis/ai/googleGenAIChat/stream", requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          sendButton.style.display = 'none'; // Hide send button
          loadingSvg.style.display = 'block'; // Show loading SVG
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let botMessageElement = null; // To hold the DOM element for the bot's message

          // Create and append the bot message element immediately
          botMessageElement = document.createElement('div');
          botMessageElement.classList.add('message', 'bot-message');
          botMessageElement.textContent = ""; // Start with "Bot: "
          chatContainer.appendChild(botMessageElement);
          chatContainer.scrollTop = chatContainer.scrollHeight;

          function processChunk({ done, value }) {
            if (done) {
              loadingSvg.style.display = 'none'; // Hide loading SVG
              sendButton.style.display = 'block'; // Show send button
              // Stream finished. If botMessageElement is still just "Bot: ", it means no tokens were received.
              if (botMessageElement && botMessageElement.textContent === "") {
                botMessageElement.textContent = "Error: No response received.";
              }
              chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom
              return;
            }

            buffer += decoder.decode(value, { stream: true });

            let lines = buffer.split('\n');
            buffer = lines.pop(); // Keep the last incomplete line for the next chunk

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.substring(6); // Remove 'data: '
                try {
                  const json = JSON.parse(data);
                  if (json.token) {
                    botMessageElement.textContent += json.token;
                  }
                  if (json.end) {
                    // End of stream signal
                    // The message is already updated, so we can just let it finish.
                  }
                } catch (e) {
                  console.error("Error parsing JSON:", e, "Line:", data);
                  if (botMessageElement) {
                    botMessageElement.textContent = "Error processing response.";
                  }
                }
              }
            }
            // Continue reading
            reader.read().then(processChunk);
          }

          reader.read().then(processChunk);
        })
        .catch((error) => {
          console.error(error);
          loadingSvg.style.display = 'none'; // Hide loading SVG
          sendButton.style.display = 'block'; // Show send button
          // If an error occurs before the bot message element is created, add a new one.
          // Otherwise, update the existing one if it exists.
          if (botMessageElement) {
            botMessageElement.textContent = "Error communicating with AI.";
          } else {
            // This case should ideally not happen if botMessageElement is created before reader.read()
            // but as a fallback:
            addMessage("Error communicating with AI.", "bot");
          }
        });
    }
  }

  sendButton.addEventListener('click', (e) => {
    e.preventDefault();
    sendMessage();
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
});

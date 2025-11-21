(function () {
  const scriptTag = document.currentScript;
  const backendUrl = scriptTag.dataset.backendUrl;

  if (!backendUrl) {
    console.error("❌ Thiếu data-backend-url trong script tag!");
    return;
  }

  // Inject CSS
  const style = document.createElement("style");
  style.textContent = `
    .ai-chat-widget {
      width: 100%;
      height: 480px;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      font-family: "Segoe UI", sans-serif;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      background: #fff;
    }

    .ai-chat-header {
      background: linear-gradient(135deg, #6a5af9, #7367f0);
      color: white;
      padding: 14px;
      text-align: center;
      font-size: 19px;
      font-weight: bold;
      letter-spacing: 0.3px;
    }

    .ai-chat-body {
      flex: 1;
      overflow-y: auto;
      padding: 18px;
      background: #f6f6f9;
    }

    .ai-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 14px;
      animation: fadeIn .2s ease;
    }

    .user-row {
      justify-content: flex-end;
    }

    .bubble {
      padding: 12px 16px;
      border-radius: 16px;
      max-width: 78%;
      line-height: 1.45;
      font-size: 14.5px;
    }

    .bubble.user {
      background: #6a5af9;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .bubble.bot {
      background: #ffffff;
      border: 1px solid #e1e1e1;
      border-bottom-left-radius: 4px;
    }

    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      flex-shrink: 0;
    }

    .avatar.bot {
      background-image: url("https://cdn-icons-png.flaticon.com/512/616/616408.png"); /* hình thỏ */
    }

    .avatar.user {
      background-image: url("https://cdn-icons-png.flaticon.com/512/1077/1077063.png");
    }

    .typing-indicator {
      display: inline-block;
      padding: 10px 14px;
      background: #fff;
      border-radius: 14px;
      border: 1px solid #eee;
      font-size: 13px;
      animation: fadeIn .2s ease;
    }

    .dots {
      display: inline-block;
      width: 22px;
      text-align: left;
    }

    .dots span {
      height: 6px;
      width: 6px;
      margin: 0 2px;
      background-color: #aaa;
      border-radius: 50%;
      display: inline-block;
      animation: blink 1.4s infinite;
    }

    .dots span:nth-child(2) { animation-delay: .2s; }
    .dots span:nth-child(3) { animation-delay: .4s; }

    @keyframes blink {
      0% { opacity: .2; transform: translateY(0px); }
      20% { opacity: 1; transform: translateY(-3px); }
      100% { opacity: .2; transform: translateY(0px); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .ai-chat-footer {
      display: flex;
      padding: 12px;
      gap: 10px;
      border-top: 1px solid #e5e5e5;
      background: #fff;
    }

    .ai-chat-footer input {
      flex: 1;
      padding: 12px 18px;
      font-size: 15px;
      border-radius: 25px;
      border: 1px solid #ccc;
      outline: none;
      transition: .2s;
    }

    .ai-chat-footer input:focus {
      border-color: #6a5af9;
      box-shadow: 0 0 0 3px rgba(106,90,249,0.25);
    }

    #ai-chat-send {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #6a5af9;
      border: none;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: .2s;
    }

    #ai-chat-send:hover {
      background: #5646d7;
    }

    #ai-chat-send svg {
      width: 22px;
      height: 22px;
      fill: white;
    }
  `;
  document.head.appendChild(style);

  // Render widget container
  const container = document.querySelector("#ai-chat-container");
  if (!container) {
    console.error("❌ Thiếu div id='ai-chat-container'");
    return;
  }

  container.classList.add("ai-chat-widget");
  container.innerHTML = `
    <div class="ai-chat-header">Gia sư Thỏ Nhí</div>
    <div class="ai-chat-body"></div>
    <div class="ai-chat-footer">
      <input id="ai-chat-input" placeholder="Nhập tin nhắn..." />
      <button id="ai-chat-send">
        <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
      </button>
    </div>
  `;

  const bodyEl = container.querySelector(".ai-chat-body");
  const inputEl = container.querySelector("#ai-chat-input");
  const sendBtn = container.querySelector("#ai-chat-send");

  function scrollBottom() {
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function addMessage(sender, text) {
    const row = document.createElement("div");
    row.className = `ai-row ${sender}-row`;

    const avatar = document.createElement("div");
    avatar.className = `avatar ${sender}`;

    const bubble = document.createElement("div");
    bubble.className = `bubble ${sender}`;
    bubble.textContent = text;

    if (sender === "bot") {
      row.appendChild(avatar);
      row.appendChild(bubble);
    } else {
      row.appendChild(bubble);
      row.appendChild(avatar);
    }

    bodyEl.appendChild(row);
    scrollBottom();
  }

  function showTyping() {
    const row = document.createElement("div");
    row.className = "ai-row bot";

    const avatar = document.createElement("div");
    avatar.className = "avatar bot";

    const typing = document.createElement("div");
    typing.className = "typing-indicator";
    typing.innerHTML = `<span>Đang trả lời</span> <span class="dots"><span></span><span></span><span></span></span>`;

    row.appendChild(avatar);
    row.appendChild(typing);
    bodyEl.appendChild(row);

    scrollBottom();
    return row;
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    addMessage("user", text);
    inputEl.value = "";

    const typingBubble = showTyping();

    try {
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      typingBubble.remove();

      addMessage("bot", data.reply || "Mình chưa hiểu ý bạn.");
    } catch (err) {
      typingBubble.remove();
      addMessage("bot", "Không thể kết nối server.");
    }
  }

  sendBtn.onclick = sendMessage;
  inputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

})();

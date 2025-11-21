(function () {
  const scriptTag = document.currentScript;
  const backendUrl = scriptTag.dataset.backendUrl;

  if (!backendUrl) {
    console.error("❌ Thiếu data-backend-url trong script tag!");
    return;
  }

  // ---- CSS ----
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
    }

    .ai-chat-header {
      background: linear-gradient(135deg, #16c5ea, #16c5ea);
      color: white;
      padding: 14px;
      text-align: center;
      font-size: 19px;
      font-weight: bold;
      letter-spacing: 0.2px;
      display:none;
    }

    .ai-chat-body {
      flex: 1;
      overflow-y: auto;
      padding: 18px;
    }

    .ai-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 12px;
      animation: fadeIn .18s ease;
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
      box-shadow: 0 1px 0 rgba(0,0,0,0.02);
    }

    .bubble.user {
      background: #16c5ea;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .bubble.bot {
      background: #ffffff;
      border: 1px solid #e6e6e6;
      border-bottom-left-radius: 4px;
    }

    /* Avatar: smaller and softer */
    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      flex-shrink: 0;
      box-shadow: 0 1px 2px rgba(0,0,0,0.06);
    }

    /* Bot avatar: rabbit SVG inline (data URI) */
    .avatar.bot {
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 24 24'><g fill='none' fill-rule='evenodd'><circle cx='12' cy='12' r='12' fill='%2316c5ea' /><g transform='translate(5 4)' fill='%23fff'><path d='M6.5 0C5.12 0 4 1.056 4 2.356c0 1.3.95 2.356 2.12 2.356.35 0 .6.299.6.667v.667c0 .368-.25.666-.6.666C4.23 7.712 3 9.045 3 10.5 3 12.986 5.238 15 8 15s5-2.014 5-4.5c0-1.455-1.23-2.788-2.12-3.072-.35-.074-.6-.402-.6-.77v-.667c0-.368.25-.667.6-.667C14.05 4.712 15 3.656 15 2.356 15 1.056 13.88 0 12.5 0c-1.38 0-2.5 1.056-2.5 2.356 0 .16.02.315.06.464C9.86 2.17 8.86 2 8 2 6.62 2 5.5 0.944 5.5 0z' /></g></g></svg>");
      background-repeat: no-repeat;
      background-size: 34px 34px;
    }

    /* User avatar: smaller, subtle border */
    .avatar.user {
      width: 30px;
      height: 30px;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 24 24'><circle cx='12' cy='8' r='3.2' fill='%23808b9a'/><path d='M12 13.5c-3.04 0-5.5 1.8-5.5 2.9V18h11v-1.6c0-1.1-2.46-2.9-5.5-2.9z' fill='%23808b9a'/></svg>");
      background-size: 30px 30px;
      border: 1px solid rgba(0,0,0,0.04);
    }

    .typing-indicator {
      display: inline-block;
      padding: 10px 14px;
      background: #fff;
      border-radius: 14px;
      border: 1px solid #eee;
      font-size: 13px;
      animation: fadeIn .18s ease;
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
      background-color: #a3a3a3;
      border-radius: 50%;
      display: inline-block;
      animation: blink 1.2s infinite;
    }

    .dots span:nth-child(2) { animation-delay: .18s; }
    .dots span:nth-child(3) { animation-delay: .36s; }

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
    }

    .ai-chat-footer input {
      flex: 1;
      padding: 12px 18px;
      font-size: 15px;
      border-radius: 25px;
      outline: none;
      transition: .18s;
    }

    .ai-chat-footer input:focus {
      border-color: #16c5ea;
      box-shadow: 0 0 0 3px rgba(106,90,249,0.18);
    }

    #ai-chat-send {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #16c5ea;
      border: none;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: .12s;
    }

    #ai-chat-send:hover { transform: translateY(-2px); background: #5646d7; }
    #ai-chat-send svg { width: 22px; height: 22px; fill: white; }
  `;
  document.head.appendChild(style);

  // ---- Render widget ----
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
      <button id="ai-chat-send" aria-label="Gửi tin nhắn">
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
      </button>
    </div>
  `;

  const bodyEl = container.querySelector(".ai-chat-body");
  const inputEl = container.querySelector("#ai-chat-input");
  const sendBtn = container.querySelector("#ai-chat-send");

  function scrollBottom() { bodyEl.scrollTop = bodyEl.scrollHeight; }

  // add message: sender = "bot" or "user"
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

  // typing indicator returns element so we can remove it when reply arrives
  function showTyping() {
    const row = document.createElement("div");
    row.className = "ai-row bot";

    const avatar = document.createElement("div");
    avatar.className = "avatar bot";

    const typing = document.createElement("div");
    typing.className = "typing-indicator";
    typing.innerHTML = `<span>Gia sư Sóc Nhí đang trả lời</span> <span class="dots"><span></span><span></span><span></span></span>`;

    row.appendChild(avatar);
    row.appendChild(typing);
    bodyEl.appendChild(row);
    scrollBottom();
    return row;
  }

  // send message to backend
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    addMessage("user", text);
    inputEl.value = "";

    const typingRow = showTyping();

    try {
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      // try to parse json; fallback to text
      let data;
      try { data = await res.json(); } catch(e) { data = { reply: await res.text() }; }

      typingRow.remove();
      addMessage("bot", data.reply || "Mình chưa hiểu ý bạn.");
    } catch (err) {
      typingRow.remove();
      addMessage("bot", "Không thể kết nối server.");
      console.error(err);
    }
  }

  sendBtn.onclick = sendMessage;
  inputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

})();

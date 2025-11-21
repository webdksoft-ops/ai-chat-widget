<script>
(function () {
  const backendUrl = "https://ai-chat-widget-ten.vercel.app/api/chat";

  // Inject CSS cho widget
  const style = document.createElement("style");
  style.textContent = `
    .ai-chat-widget {
      width: 100%;
      height: 450px;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      font-family: "Segoe UI", Arial, sans-serif;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .ai-chat-header {
      background: linear-gradient(135deg, #6a5af9, #7367f0);
      color: white;
      padding: 12px;
      text-align: center;
      font-weight: bold;
      font-size: 18px;
      letter-spacing: 0.5px;
    }

    .ai-chat-body {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      background: #fafafa;
    }

    .ai-chat-footer {
      padding: 12px;
      display: flex;
      gap: 8px;
      background: white;
      border-top: 1px solid #eee;
    }

    .ai-chat-footer input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 22px;
      border: 1px solid #ccc;
      background: #fdfdfd;
      transition: all 0.2s ease;
    }

    .ai-chat-footer input:focus {
      border-color: #7c6ef6;
      box-shadow: 0 0 0 2px rgba(124,110,246,0.2);
      outline: none;
    }

    #ai-chat-send {
      width: 45px;
      height: 45px;
      min-width: 45px;
      border-radius: 50%;
      border: none;
      background: #6a5af9;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: 0.2s;
    }

    #ai-chat-send:hover {
      background: #5548e0;
    }

    #ai-chat-send svg {
      width: 20px;
      height: 20px;
      fill: white;
    }

    .msg {
      display: flex;
      margin-bottom: 12px;
      align-items: flex-start;
      gap: 8px;
      animation: fadeIn 0.2s ease;
    }

    .msg .bubble {
      padding: 10px 14px;
      border-radius: 14px;
      max-width: 80%;
      font-size: 14px;
      line-height: 1.4;
    }

    .msg.user {
      justify-content: flex-end;
    }

    .msg.user .bubble {
      background: #6a5af9;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .msg.bot .bubble {
      background: #ffffff;
      border: 1px solid #eee;
      border-bottom-left-radius: 4px;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .avatar.bot {
      background: url('https://cdn-icons-png.flaticon.com/512/4712/4712100.png') center/cover;
    }

    .avatar.user {
      background: url('https://cdn-icons-png.flaticon.com/512/1077/1077063.png') center/cover;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // Chọn div
  const container = document.querySelector("#ai-chat-container");
  if (!container) {
    console.error("Vui lòng tạo div có id 'ai-chat-container'");
    return;
  }

  // Cấu trúc HTML
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

  function addMessage(sender, text) {
    const row = document.createElement("div");
    row.className = `msg ${sender}`;

    const avatar = document.createElement("div");
    avatar.className = `avatar ${sender}`;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    if (sender === "user") {
      row.appendChild(bubble);
      row.appendChild(avatar);
    } else {
      row.appendChild(avatar);
      row.appendChild(bubble);
    }

    bodyEl.appendChild(row);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  sendBtn.onclick = async () => {
    const text = inputEl.value.trim();
    if (!text) return;

    addMessage("user", text);
    inputEl.value = "";

    try {
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      addMessage("bot", data.reply || "Mình chưa hiểu ý bạn lắm...");
    } catch (err) {
      addMessage("bot", "Không thể kết nối máy chủ.");
      console.error(err);
    }
  };

})();
</script>

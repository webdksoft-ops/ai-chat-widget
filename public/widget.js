(function () {
  const backendUrl = "https://ai-chat-widget-plum.vercel.app/api/chat";

  // Inject CSS cho widget
  const style = document.createElement("style");
  style.textContent = `
    .ai-chat-widget {
      width: 100%;
      height: 400px;
      border: 1px solid #ccc;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      font-family: Arial, sans-serif;
      overflow: hidden;
    }
    .ai-chat-header { background: #4c6ef5; color: white; padding: 10px; text-align: center; font-weight: bold; }
    .ai-chat-body { flex: 1; padding: 10px; overflow-y: auto; }
    .ai-chat-footer { padding: 10px; display: flex; gap: 5px; }
    .ai-chat-footer input { flex: 1; padding: 5px; }
    .msg { padding: 5px 10px; margin-bottom: 5px; border-radius: 5px; max-width: 80%; }
    .msg.user { background: #4c6ef5; color: white; margin-left: auto; }
    .msg.bot { background: #eee; color: #333; margin-right: auto; }
  `;
  document.head.appendChild(style);

  // Chọn div bạn muốn hiển thị chat
  const container = document.querySelector("#ai-chat-container");
  if (!container) {
    console.error("Vui lòng tạo div có id 'ai-chat-container'");
    return;
  }

  // Tạo cấu trúc chat bên trong div container
  container.classList.add("ai-chat-widget");
  container.innerHTML = `
    <div class="ai-chat-header">AI Chat</div>
    <div class="ai-chat-body"></div>
    <div class="ai-chat-footer">
      <input id="ai-chat-input" placeholder="Nhập tin nhắn..." />
      <button id="ai-chat-send">Gửi</button>
    </div>
  `;

  const bodyEl = container.querySelector(".ai-chat-body");
  const inputEl = container.querySelector("#ai-chat-input");
  const sendBtn = container.querySelector("#ai-chat-send");

  function addMessage(sender, text) {
    const div = document.createElement("div");
    div.className = `msg ${sender}`;
    div.textContent = text;
    bodyEl.appendChild(div);
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
      addMessage("bot", data.reply || "Không có phản hồi");
    } catch (err) {
      addMessage("bot", "Lỗi kết nối server");
      console.error(err);
    }
  };
})();

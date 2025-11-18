(function () {
  const backendUrl = document.currentScript.getAttribute("data-backend-url");

  // CSS inject
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "https://your-vercel-app.vercel.app/widget.css";
  document.head.appendChild(style);

  // Tạo nút mở chat
  const button = document.createElement("div");
  button.id = "ai-chat-button";
  button.innerHTML = "💬";
  document.body.appendChild(button);

  // Tạo popup chat
  const popup = document.createElement("div");
  popup.id = "ai-chat-popup";
  popup.innerHTML = `
    <div class="ai-chat-header">AI Chat</div>
    <div class="ai-chat-body"></div>
    <div class="ai-chat-footer">
        <input id="ai-chat-input" placeholder="Nhập tin nhắn..." />
        <button id="ai-chat-send">Gửi</button>
    </div>
  `;
  document.body.appendChild(popup);

  let open = false;

  button.onclick = () => {
    open = !open;
    popup.style.display = open ? "flex" : "none";
  };

  document.getElementById("ai-chat-send").onclick = async () => {
    const inputEl = document.getElementById("ai-chat-input");
    const text = inputEl.value;
    if (!text) return;

    addMessage("user", text);
    inputEl.value = "";

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    addMessage("bot", data.reply);
  };

  function addMessage(sender, text) {
    const body = document.querySelector(".ai-chat-body");
    const div = document.createElement("div");
    div.className = `msg ${sender}`;
    div.innerText = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }
})();

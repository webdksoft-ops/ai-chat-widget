(function () {
  const chatBtn = document.createElement('button');
  chatBtn.innerHTML = "Chat AI";
  chatBtn.style.position = "fixed";
  chatBtn.style.bottom = "20px";
  chatBtn.style.right = "20px";
  chatBtn.style.padding = "10px 16px";
  chatBtn.style.background = "#0078ff";
  chatBtn.style.color = "#fff";
  chatBtn.style.borderRadius = "8px";
  chatBtn.style.cursor = "pointer";

  document.body.appendChild(chatBtn);

  const box = document.createElement('div');
  box.style.position = "fixed";
  box.style.bottom = "70px";
  box.style.right = "20px";
  box.style.width = "320px";
  box.style.height = "420px";
  box.style.background = "#fff";
  box.style.border = "1px solid #ccc";
  box.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.2)";
  box.style.borderRadius = "10px";
  box.style.display = "none";
  box.style.flexDirection = "column";
  box.style.overflow = "hidden";
  document.body.appendChild(box);

  chatBtn.onclick = () => {
    box.style.display = (box.style.display === "none" ? "flex" : "none");
  };

  box.innerHTML = `
    <div style="padding:10px; background:#0078ff; color:white;">Chat AI</div>
    <div id="msgs" style="flex:1; padding:10px; overflow-y:auto;"></div>
    <div style="padding:10px; display:flex;">
      <input id="msg" style="flex:1; padding:5px;" placeholder="Nhập tin..."/>
      <button id="send" style="margin-left:5px;">Gửi</button>
    </div>
  `;

  const msgs = box.querySelector("#msgs");
  const input = box.querySelector("#msg");

  box.querySelector("#send").onclick = async () => {
    const text = input.value.trim();
    if (!text) return;
    msgs.innerHTML += `<div><b>Bạn:</b> ${text}</div>`;
    input.value = "";

    const res = await fetch('/api/chat', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    msgs.innerHTML += `<div><b>AI:</b> ${data.answer}</div>`;
    msgs.scrollTop = msgs.scrollHeight;
  };
})();

(function () {
  const scriptTag = document.currentScript;
  const backendUrl = scriptTag && scriptTag.dataset && scriptTag.dataset.backendUrl;

  if (!backendUrl) {
    console.error("❌ Thiếu data-backend-url trong script tag!");
    return;
  }

  /* -------------------- CSS -------------------- */
  const style = document.createElement("style");
  style.textContent = `
  /* Container */
  .ai-chat-widget{
    width:100%;
    height:520px;
    max-width:900px;
    border-radius:14px;
    display:flex;
    flex-direction:column;
    font-family: "Segoe UI", Roboto, Arial, sans-serif;
    overflow:hidden;
  }

  .ai-chat-header{
    background: linear-gradient(135deg,#16c5ea,#16c5ea);
    color:#fff;
    padding:14px 16px;
    font-weight:700;
    font-size:18px;
    text-align:center;
    display:none;
  }

  .ai-chat-body{
    flex:1;
    padding:18px;
    overflow-y:auto;
  }

  .ai-row{
    display:flex;
    align-items:flex-start;
    gap:10px;
    margin-bottom:12px;
    animation: fadeIn .18s ease;
  }

  .ai-row.user-row{ justify-content:flex-end; }

  .bubble{
    padding:12px 16px;
    border-radius:14px;
    max-width:78%;
    line-height:1.45;
    font-size:14.5px;
    box-shadow: 0 1px 0 rgba(0,0,0,0.02);
    word-wrap: break-word;
    white-space:pre-wrap;
  }

  .bubble.user{ background:#16c5ea; color:#fff; border-bottom-right-radius:4px; }
  .bubble.bot{ background:#fff; border:1px solid #e7e7ee; border-bottom-left-radius:4px; }

  .avatar{
    width:34px;
    height:34px;
    border-radius:50%;
    background-size:cover;
    background-position:center;
    flex-shrink:0;
    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  }

  /* Rabbit bot (SVG datauri) */
  .avatar.bot{
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 24 24'><g fill='none' fill-rule='evenodd'><circle cx='12' cy='12' r='12' fill='%2316c5ea' /><g transform='translate(5 4)' fill='%23fff'><path d='M6.5 0C5.12 0 4 1.056 4 2.356c0 1.3.95 2.356 2.12 2.356.35 0 .6.299.6.667v.667c0 .368-.25.666-.6.666C4.23 7.712 3 9.045 3 10.5 3 12.986 5.238 15 8 15s5-2.014 5-4.5c0-1.455-1.23-2.788-2.12-3.072-.35-.074-.6-.402-.6-.77v-.667c0-.368.25-.667.6-.667C14.05 4.712 15 3.656 15 2.356 15 1.056 13.88 0 12.5 0c-1.38 0-2.5 1.056-2.5 2.356 0 .16.02.315.06.464C9.86 2.17 8.86 2 8 2 6.62 2 5.5 0.944 5.5 0z' /></g></g></svg>");
    background-repeat:no-repeat;
    background-size:34px 34px;
  }

  .avatar.user{
    width:30px;
    height:30px;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 24 24'><circle cx='12' cy='8' r='3.2' fill='%23808b9a'/><path d='M12 13.5c-3.04 0-5.5 1.8-5.5 2.9V18h11v-1.6c0-1.1-2.46-2.9-5.5-2.9z' fill='%23808b9a'/></svg>");
    background-size:30px 30px;
    border:1px solid rgba(0,0,0,0.04);
  }

  .typing-indicator{
    display:inline-block;
    padding:10px 14px;
    background:#fff;
    border-radius:14px;
    border:1px solid #eee;
    font-size:13px;
  }

  .dots{ display:inline-block; width:22px; text-align:left; }
  .dots span{ height:6px; width:6px; margin:0 2px; background:#a3a3a3; border-radius:50%; display:inline-block; animation: blink 1.2s infinite; }
  .dots span:nth-child(2){ animation-delay:.18s; } .dots span:nth-child(3){ animation-delay:.36s; }
  @keyframes blink{ 0%{opacity:.25; transform:translateY(0)} 20%{opacity:1; transform:translateY(-3px)} 100%{opacity:.25; transform:translateY(0)} }
  @keyframes fadeIn{ from{opacity:0; transform:translateY(4px)} to{opacity:1; transform:translateY(0)} }

  /* Footer: input + send + mic + tts toggle */
  .ai-chat-footer{
    display:flex;
    align-items:center;
    gap:10px;
    padding:12px 0;
    border-top:1px solid #eaeaf2;
  }

  .voice-btn{
    width:44px; height:44px; border-radius:50%;
    background:#ffb74d; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center; font-size:18px;
    transition:transform .12s ease, background .12s;
  }
  .voice-btn:hover{ transform:translateY(-3px); }
  .voice-btn.recording{ background:#e53935; color:#fff; animation: pulse 1s infinite; }
  @keyframes pulse{ 0%{transform:scale(1)} 50%{transform:scale(1.06)} 100%{transform:scale(1)} }

  .tts-toggle{
    width:44px; height:44px; border-radius:50%;
    background:#eef2ff; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center; font-size:16px;
  }
  .tts-toggle.active{ background:#16c5ea; color:#fff; }

  .ai-chat-footer input{
    flex:1; padding:12px 16px; border-radius:24px; border:1px solid #d7d7df;
    font-size:15px; outline:none; transition:box-shadow .12s, border-color .12s;
  }
  .ai-chat-footer input:focus{ border-color:#16c5ea; box-shadow:0 0 0 4px rgba(106,90,249,0.14); }

  #ai-chat-send{
    width:46px; height:46px; border-radius:50%; background:#16c5ea; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center; transition:transform .12s;
  }
  #ai-chat-send:hover{ transform:translateY(-3px); }
  #ai-chat-send svg{ width:20px; height:20px; fill:#fff; }

  /* small helper */
  .meta-small { font-size:12px; color:#7b7f88; margin-top:6px; text-align:center; }
  `;
  document.head.appendChild(style);

  /* -------------------- Render widget -------------------- */
  const container = document.querySelector("#ai-chat-container");
  if (!container) {
    console.error("❌ Thiếu div id='ai-chat-container'");
    return;
  }

  container.classList.add("ai-chat-widget");
  container.innerHTML = `
    <div class="ai-chat-header">Gia sư Thỏ Hồng</div>
    <div class="ai-chat-body" role="log" aria-live="polite"></div>
    <div class="meta-small">Nhấn mic để nói — AI có thể trả lời bằng giọng nói (trẻ em)</div>
    <div class="ai-chat-footer">
     
      <input id="ai-chat-input" placeholder="Nhập tin nhắn..." aria-label="Nhập tin nhắn" />
      <button id="ai-voice-btn" class="voice-btn" title="Nhấn để nói" aria-pressed="false">🎤</button>
      <button id="ai-chat-send" aria-label="Gửi tin nhắn">
        <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
      </button>
      <button id="ai-tts-toggle" class="tts-toggle" title="Bật/Tắt giọng nói" aria-pressed="true">🔊</button>
    </div>
  `;

  const bodyEl = container.querySelector(".ai-chat-body");
  const inputEl = container.querySelector("#ai-chat-input");
  const sendBtn = container.querySelector("#ai-chat-send");
  const voiceBtn = container.querySelector("#ai-voice-btn");
  const ttsToggle = container.querySelector("#ai-tts-toggle");
  /* -------------------- Helpers -------------------- */
  function scrollBottom() { bodyEl.scrollTop = bodyEl.scrollHeight; }

  function createRow(sender, text) {
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
    return row;
  }

  function addMessage(sender, text) {
    const row = createRow(sender, text);
    bodyEl.appendChild(row);
    scrollBottom();
    return row;
  }

  function showTyping() {
    const row = document.createElement("div");
    row.className = "ai-row bot";

    const avatar = document.createElement("div");
    avatar.className = "avatar bot";

    const typing = document.createElement("div");
    typing.className = "typing-indicator";
    typing.innerHTML = `<span>Gia sư Thỏ Hồng đang trả lời</span> <span class="dots"><span></span><span></span><span></span></span>`;

    row.appendChild(avatar);
    row.appendChild(typing);
    bodyEl.appendChild(row);
    scrollBottom();
    return row;
  }
  /* -------------------- Text-to-Speech (TTS) -------------------- */
  let ttsEnabled = true;
  // initialize from toggle state (aria-pressed true default)
  ttsToggle.classList.add("active");
  ttsToggle.addEventListener("click", () => {
    ttsEnabled = !ttsEnabled;
    ttsToggle.classList.toggle("active", ttsEnabled);
    ttsToggle.setAttribute("aria-pressed", ttsEnabled ? "true" : "false");
  });

  // We'll choose a Vietnamese voice if available; otherwise fallback to default with higher pitch.
  let selectedVoice = null;
  function chooseVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;
    // Prefer 'vi-VN' voices
    selectedVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith("vi"));
    if (!selectedVoice) {
      // fallback: pick any female sounding voice or first voice
      selectedVoice = voices.find(v => /female|woman|girl/i.test(v.name)) || voices[0];
    }
  }
  // browsers may load voices asynchronously
  chooseVoice();
  speechSynthesis.onvoiceschanged = chooseVoice;

  function speakText(text) {
  if (!ttsEnabled) return;
  if (!("speechSynthesis" in window)) return;

  try {
    const utter = new SpeechSynthesisUtterance(text);

    // Giọng tự nhiên, không robot
    utter.pitch = 1.2;     // nhẹ, tự nhiên
    utter.rate = 1.02;     // chậm nhẹ -> nghe như người thật
    utter.volume = 1;

    let voices = speechSynthesis.getVoices();

    // Nếu chưa load voice → đợi
    if (!voices || voices.length === 0) {
      setTimeout(() => speakText(text), 300);
      return;
    }

    // Danh sách giọng nghe mượt trên Chrome/Edge
    const preferred = [
      "Google UK English Male",
      "Google US English",
      "Google UK English Female",
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Jenny Online (Natural)"
    ];

    let bestVoice = null;

    // Nếu bạn đã set selectedVoice trước đó → ưu tiên dùng trước
    if (selectedVoice) {
      bestVoice = voices.find(v => v.name === selectedVoice.name);
    }

    // Nếu chưa có thì tìm giọng Google/Microsoft đẹp nhất
    if (!bestVoice) {
      bestVoice = voices.find(v => preferred.includes(v.name));
    }

    // Nếu không có → fallback bằng giọng English đầu tiên
    if (!bestVoice) {
      bestVoice = voices.find(v => v.lang.startsWith("en")) || voices[0];
    }

    utter.voice = bestVoice;

    // Hủy các lần đọc cũ để tránh đè nhau
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);

  } catch (err) {
    console.warn("TTS Error:", err);
  }
}

  /* -------------------- Speech-to-Text (STT) - Web Speech API -------------------- */
  let recognition = null;
  let isRecording = false;
  const supportsSTT = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  if (supportsSTT) {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new Rec();
    recognition.lang = "vi-VN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      isRecording = true;
      voiceBtn.classList.add("recording");
      voiceBtn.setAttribute("aria-pressed", "true");
    };
    recognition.onend = () => {
      isRecording = false;
      voiceBtn.classList.remove("recording");
      voiceBtn.setAttribute("aria-pressed", "false");
    };
    recognition.onerror = (ev) => {
      console.warn("Recognition error", ev);
      isRecording = false;
      voiceBtn.classList.remove("recording");
      voiceBtn.setAttribute("aria-pressed", "false");
    };
    recognition.onresult = (ev) => {
      try {
        const text = ev.results[0][0].transcript;
        // Put recognized text into input and auto-send if desired or leave for user
        inputEl.value = text;
        // Optionally auto-send: uncomment next line
        // sendMessage();
      } catch (e) { console.warn(e); }
    };
  } else {
    // disable button if no support
    voiceBtn.title = "Trình duyệt không hỗ trợ thu âm (SpeechRecognition)";
    voiceBtn.style.opacity = "0.6";
  }

  voiceBtn.addEventListener("click", () => {
    if (!recognition) {
      alert("Trình duyệt của bạn không hỗ trợ thu âm (SpeechRecognition). Vui lòng dùng Chrome/Edge.");
      return;
    }
    if (isRecording) {
      recognition.stop();
    } else {
      try { recognition.start(); } catch (e) { console.warn(e); }
    }
  });

  /* -------------------- Send Message -------------------- */
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    // add user bubble
    addMessage("user", text);
    inputEl.value = "";

    // show typing indicator
    const typingRow = showTyping();

    try {
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      // support both JSON {reply: "..."} or plain text
      let data;
      try { data = await res.json(); } catch (e) { data = { reply: await res.text() }; }

      // remove typing indicator
      if (typingRow && typingRow.parentNode) typingRow.remove();

      const reply = (data && (data.reply || data.message || data.text)) || "Mình chưa hiểu ý bạn.";
      addMessage("bot", reply);

      // speak if enabled
      speakText(reply);
    } catch (err) {
      if (typingRow && typingRow.parentNode) typingRow.remove();
      addMessage("bot", "Không thể kết nối server.");
      console.error("Send error", err);
      speakText("Xin lỗi, không thể kết nối tới máy chủ.");
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /* -------------------- Accessibility: keyboard shortcuts -------------------- */
  // Press Ctrl+M to toggle microphone (convenience)
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
      voiceBtn.click();
    }
  });

  /* -------------------- Init: greeting -------------------- */
  // small welcome message
  setTimeout(() => {
    const welcome = "Xin chào! Mình là Gia sư Thỏ Hồng — bạn muốn hỏi gì hôm nay?";
    addMessage("bot", welcome);
    // speak short greeting if enabled
    speakText(welcome);
  }, 300);

  /* -------------------- Notes for deployers (console) -------------------- */
  console.info("AI Chat Widget loaded. Backend:", backendUrl);
  console.info("STT supported:", supportsSTT);
  console.info("TTS supported:", !!window.speechSynthesis);
})();

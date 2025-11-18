const backendUrl = "https://ai-chat-widget.vercel.app/api/chat";
const systemMessage = {
  role: "system",
  content:
    "Bạn là gia sư Thỏ Nhí giúp đỡ học sinh, hãy trả lời một cách ngắn gọn và thân thiện. Sử dụng Tiếng Việt khi trả lời. Lưu ý rằng bạn đang giao tiếp bằng giọng nói thông qua text to speech và speech to text nên đừng yêu cầu người dùng gửi văn bản và câu trả lời ở dạng đọc được. Câu trả lời cần giới hạn trong phạm vi kiến thức tiểu học.",
};
let conversationHistory = [systemMessage];
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let isProcessing = false;
let silenceTimer;

// Initialize Web Audio API for silence detection
let audioContext;
let analyser;
let microphone;
let javascriptNode;

// Add CSS for button animation and text overflow
const style = document.createElement("style");
style.textContent = `
  .recording-animation {
    opacity: 0.8;
  }
  .processing-animation {
    animation: fade 1s infinite ease-in-out;
  }
  @keyframes fade {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  .transcript-text {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    white-space: normal;
  }
`;
document.head.appendChild(style);

async function setupAudioContext() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    microphone = audioContext.createMediaStreamSource(stream);
    mediaRecorder = new MediaRecorder(stream);
    microphone.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);

    javascriptNode.onaudioprocess = () => {
      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      const average =
        array.reduce((sum, value) => sum + value, 0) / array.length;

      if (average < 10 && isRecording) {
        if (!silenceTimer) {
          silenceTimer = setTimeout(() => {
            if (isRecording) {
              stopRecording();
            }
          }, 3000);
        }
      } else {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
    };

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const audioBase64 = await blobToBase64(audioBlob);
      audioChunks = [];
      sendToAPI(audioBase64);
    };
  } catch (err) {
    console.error("Error accessing microphone:", err);
    updateButtonState(false);
  }
}

// Convert Blob to Base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Update button state
function updateButtonState(isDisabled) {
  const button = window.recordButton;
  button.disabled = isDisabled;
  if (isDisabled) {
    button.classList.add(
      isRecording ? "recording-animation" : "processing-animation"
    );
  } else {
    button.classList.remove("recording-animation", "processing-animation");
  }
}

// Send audio to API
async function sendToAPI(audioBase64) {
  try {
    isProcessing = true;
    updateButtonState(true);

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "",
        audio: audioBase64,
        history: [...conversationHistory],
      }),
    });

    const data = await res.json();
    const transcript = data.transcript || "Unrecognized audio";
    conversationHistory.push({ role: "user", content: transcript });
    // lastMessageTranscript.textContent = data.text;
    // lastMessageTranscript.classList.add("transcript-text");

    lastMessageTranscript.textContent = "Click vào mình để nói chuyện nhé!";
    conversationHistory.push({ role: "ai", content: data.text });
    console.log("API Response:", data.text);

    if (data.audio) {
      const audioElem = new Audio(`data:audio/mp3;base64,${data.audio}`);
      audioElem.play();
    }
  } catch (err) {
    console.error("API Error:", err);
  } finally {
    isProcessing = false;
    updateButtonState(false);
  }
}

// Toggle recording
function toggleRecording() {
  if (isProcessing) return; // Prevent action during API processing

  if (!isRecording) {
    audioChunks = [];
    mediaRecorder.start();
    isRecording = true;
    window.lastMessageTranscript.textContent = "Mình đang nghe...";
    updateButtonState(true);
  } else {
    stopRecording();
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    isRecording = false;
    window.lastMessageTranscript.textContent = "Mình đang suy nghĩ...";
    clearTimeout(silenceTimer);
    silenceTimer = null;
    updateButtonState(true); // Keep disabled until API response
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const recordButton = document.querySelector("#img_comp-kq5aeed1");
  recordButton.style.cursor = "pointer";
  const lastMessageTranscript = document.querySelector(
    "#comp-mfmatg4k > h1 > span > span > span > span"
  );

  window.recordButton = recordButton;
  window.lastMessageTranscript = lastMessageTranscript;

  if (!recordButton) {
    console.error("Record button not found!");
    return;
  }

  recordButton.addEventListener("click", async () => {
    if (!audioContext) {
      await setupAudioContext();
    }
    toggleRecording();
  });
});

import OpenAI from "openai";
// Tên miền widget của bạn. Nên chỉ định cụ thể để bảo mật tốt hơn.
const ALLOWED_ORIGIN = 'https://thuviensomnhongha.com';

export default async function handler(req, res) {
  
  // **SỬA LỖI:** Thiết lập tất cả các header CORS trước khi kiểm tra method
  // Điều này đảm bảo rằng ngay cả yêu cầu OPTIONS (preflight) cũng nhận được header.
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Phải bao gồm OPTIONS
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Phải bao gồm header đang được sử dụng

  // 2. XỬ LÝ YÊU CẦU PREFLIGHT (OPTIONS)
  // Nếu trình duyệt gửi yêu cầu OPTIONS, nó chỉ đang kiểm tra CORS.
  if (req.method === 'OPTIONS') {
    // Trả về 200 OK ngay lập tức, các header CORS đã được thiết lập ở trên.
    res.status(200).end(); 
    return;
  }
  
  // 3. XỬ LÝ YÊU CẦU CHÍNH (POST)
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing 'text' in request body." });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const audio = await client.audio.speech.create({
      model: "tts-1", // Model gpt-4o-mini-tts không tồn tại, nên dùng "tts-1" hoặc "tts-1-hd"
      voice: "shimmer", // Đã đổi sang "shimmer" vì "juniper" có thể không phải là giọng chính thức của OpenAI
      input: text,
      format: "mp3"
    });

    const buffer = Buffer.from(await audio.arrayBuffer());

    // Thiết lập Content-Type cho phản hồi âm thanh
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);

  } catch (err) {
    console.error("TTS error:", err.message);
    // Thêm thông tin chi tiết vào lỗi để dễ debug hơn
    res.status(500).json({ error: "TTS failed", details: err.message });
  }
}

import OpenAI from "openai";
// Tên miền widget của bạn. Nên chỉ định cụ thể để bảo mật tốt hơn.
const ALLOWED_ORIGIN = 'https://thuviensomnhongha.com';
export default async function handler(req, res) {

  // 1. THIẾT LẬP CÁC HEADER CHO CORS (Bảo mật)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 2. XỬ LÝ YÊU CẦU PREFLIGHT (OPTIONS)
  // Nếu trình duyệt gửi yêu cầu OPTIONS, nó chỉ đang kiểm tra CORS.
  if (req.method === 'OPTIONS') {
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

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const audio = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",        // giọng giống ChatGPT
      voice: "juniper",                // giọng trẻ em, dễ thương
      input: text,
      format: "mp3"
    });

    const buffer = Buffer.from(await audio.arrayBuffer());

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);

  } catch (err) {
    console.error("TTS error", err);
    res.status(500).json({ error: "TTS failed" });
  }
}

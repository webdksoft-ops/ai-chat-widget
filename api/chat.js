import OpenAI from "openai";

// Tên miền widget của bạn. Nên chỉ định cụ thể để bảo mật tốt hơn.
const ALLOWED_ORIGIN = 'https://thuviensomnhongha.com';
// Hoặc sử dụng '*' nếu bạn muốn cho phép mọi tên miền truy cập, nhưng KHÔNG NÊN làm trong production.

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

  // Khởi tạo OpenAI sau khi đã xử lý CORS/Method Check
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const body = req.body;
  
  // Kiểm tra xem message có tồn tại không
  if (!body || !body.message) {
      res.status(400).json({ error: 'Missing message in request body' });
      return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: body.message }
      ]
    });
  
    res.status(200).json({
      reply: completion.choices[0].message.content
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    // Trả về lỗi server 500 nếu có vấn đề với API
    res.status(500).json({ 
        error: "Lỗi nội bộ server khi gọi AI", 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}

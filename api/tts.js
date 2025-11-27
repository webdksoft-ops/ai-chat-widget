import OpenAI from "openai";

const ALLOWED_ORIGIN = "https://thuviensomnhongha.com";

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text field" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // --- GIỌNG CHATGPT (juniper – trẻ em) ---
    const audio = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",      // Model TTS ChatGPT mới nhất 2025
      voice: "juniper",              // Giọng trẻ em dễ thương
      input: text,
      format: "mp3"
    });

    const buffer = Buffer.from(await audio.arrayBuffer());

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);

  } catch (err) {
    console.error("TTS error:", err);
    res.status(500).json({ error: "TTS failed", detail: err.message });
  }
}

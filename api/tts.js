import OpenAI from "openai";

export default async function handler(req, res) {
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

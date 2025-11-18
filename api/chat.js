import OpenAI from "openai";

export default async function handler(req, res) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const body = req.body;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: body.message }
    ]
  });

  res.status(200).json({
    reply: completion.choices[0].message.content
  });
}

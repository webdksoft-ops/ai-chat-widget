export default async function handler(req, res) {
  try {
    const { message } = req.body;

    const reply = "Xin chào! Tôi có thể giúp gì cho bạn?";

    res.status(200).json({
      answer: reply
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error', details: e.message });
  }
}

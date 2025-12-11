import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/summarize", async (req, res) => {
  const { text, mode } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Text is required" });
  }

  const prompts = {
    standard: `Provide an extremely clear, precise summary of the following text. Keep it 2–4 sentences, focus only on essential points, and rewrite it cleanly without repeating phrases:\n\n${text}`,
    short: `Summarize the following text in ONE ultra-short sentence capturing only the core idea:\n\n${text}`,
    bullet: `Summarize the following text into 3–5 clean bullet points with no filler:\n\n${text}`,
    detailed: `Provide a structured summary of the following text with short sections for: Main Idea, Key Points, Important Details. Keep it concise and readable:\n\n${text}`,
    rewrite: `Rewrite the following text to be clearer, cleaner, and easier to read while keeping all meaning. Do NOT summarize:\n\n${text}`
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`
      },
      body: JSON.stringify({
        model: "tngtech/deepseek-r1t2-chimera:free",
        messages: [{ role: "user", content: prompts[mode] || prompts.standard }]
      })
    });

    const data = await response.json();
    const summary = data?.choices?.[0]?.message?.content || "No summary returned";

    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

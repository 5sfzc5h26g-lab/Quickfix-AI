import express from "express";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. The site will load, but /api/generate will not work.");
}

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "32kb" }));
app.use(express.static(__dirname));

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.AI_REQUESTS_PER_HOUR || 30),
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/generate", limiter);

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const allowedTypes = new Set(["description", "review", "menu", "captions"]);
const allowedTones = new Set(["Professional", "Friendly", "Simple", "Upbeat"]);

app.post("/api/generate", async (req, res) => {
  try {
    if (!client) return res.status(503).json({ error: "AI service is not configured yet." });

    const { type, tone, text } = req.body || {};
    if (!allowedTypes.has(type) || !allowedTones.has(tone) || typeof text !== "string") {
      return res.status(400).json({ error: "Please provide a valid request." });
    }

    const cleaned = text.trim();
    if (cleaned.length < 3) return res.status(400).json({ error: "Please enter a little more information." });
    if (cleaned.length > 6000) return res.status(400).json({ error: "Please keep the request under 6,000 characters." });

    const task = {
      description: "Rewrite the business description so it is clear, professional, accurate, and appealing. Do not invent facts.",
      review: "Write one professional reply to the customer's review. Be polite, specific to the provided text, and do not make promises the business did not state.",
      menu: "Clean up the menu or price-list wording and organization. Preserve every provided item and price exactly; do not invent prices or products.",
      captions: "Create 10 short, varied social captions for the business. Only use facts contained in the provided details. Avoid claims about guaranteed results."
    }[type];

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      instructions:
        "You are QuickFix AI, a small-business writing assistant. " +
        "Follow the user's task, preserve factual accuracy, and never invent business details, prices, testimonials, awards, guarantees, or credentials. " +
        "Return only the finished copy unless a short heading is helpful. " +
        "Task: " + task + " Tone: " + tone + ".",
      input: cleaned
    });

    const output = (response.output_text || "").trim();
    if (!output) return res.status(502).json({ error: "The AI returned no text." });

    res.json({ output });
  } catch (error) {
    console.error("AI request error:", error?.message || error);
    res.status(500).json({ error: "The AI service could not complete that request." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(process.env.OPENAI_API_KEY) });
});

app.listen(port, () => console.log(`QuickFix AI running on port ${port}`));

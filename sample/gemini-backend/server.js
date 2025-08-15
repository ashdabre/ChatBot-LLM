// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleAuth } from "google-auth-library";
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // for Node <18

// ---------------------
// Config & service account
// ---------------------
const SERVICE_ACCOUNT_PATH = "./service-account1.json"; // keep private in backend
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("Service account file not found!", SERVICE_ACCOUNT_PATH);
  process.exit(1);
}

const auth = new GoogleAuth({
  keyFile: SERVICE_ACCOUNT_PATH,
  scopes: [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/generative-language",
  ],
});

// Gemini endpoint
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

// ---------------------
// Express setup
// ---------------------
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---------------------
// Helper to extract text from Gemini response
// ---------------------
function extractTextFromGemini(data) {
  try {
    if (typeof data?.generatedText === "string" && data.generatedText.trim()) {
      return data.generatedText.trim();
    }

    if (Array.isArray(data?.candidates) && data.candidates.length > 0) {
      const first = data.candidates[0];
      const parts = first?.content?.parts;
      if (Array.isArray(parts) && parts.length > 0) {
        return parts.map((p) => p?.text ?? "").join("").trim();
      }
      if (typeof first?.output_text === "string" && first.output_text.trim()) {
        return first.output_text.trim();
      }
      const maybe = first?.content?.parts?.[0]?.text || first?.outputText || first?.text;
      if (typeof maybe === "string" && maybe.trim()) return maybe.trim();
    }

    if (typeof data?.text === "string" && data.text.trim()) return data.text.trim();
    if (typeof data?.result?.content?.text === "string") return data.result.content.text.trim();

    return null;
  } catch (err) {
    console.warn("extractTextFromGemini error:", err);
    return null;
  }
}

// ---------------------
// API Routes
// ---------------------
app.get("/api/gemini", (req, res) => {
  res.send('POST JSON { "prompt": "your text" } to this endpoint.');
});

app.post("/api/gemini", async (req, res) => {
  const prompt = (req.body?.prompt || "").toString();
  if (!prompt) return res.status(400).json({ error: "Missing prompt in request body" });

  try {
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const token = accessTokenResponse?.token;
    if (!token) {
      console.error("No access token from service account:", accessTokenResponse);
      return res.status(500).json({ error: "Failed to obtain access token" });
    }

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("Gemini did not return JSON:", text.slice(0, 1000));
      return res.status(response.status || 500).json({ error: "Upstream returned non-JSON", rawText: text });
    }

    const generatedText = extractTextFromGemini(parsed) || "";
    return res.status(200).json({ generatedText, raw: parsed });
  } catch (err) {
    console.error("Gemini fetch error:", err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

// ---------------------
// Serve React frontend
// ---------------------
const __dirname = path.resolve();
const FRONTEND_DIST = path.join(__dirname, "dist"); // Vite build output

app.use(express.static(FRONTEND_DIST));

// Fallback for React Router / SPA
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  }
});

// ---------------------
// Start server
// ---------------------
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

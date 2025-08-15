// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleAuth } from "google-auth-library";
import fs from "fs";
import fetch from "node-fetch";
// keep for Node < 18; OK if installed

const SERVICE_ACCOUNT_PATH = "./service-account1.json"; // keep your filename
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("Service account file not found!", SERVICE_ACCOUNT_PATH);
  process.exit(1);
}

const app = express();
app.use(cors()); // allow all origins by default for local dev
app.use(bodyParser.json());

// Google auth (service account)
const auth = new GoogleAuth({
  keyFile: SERVICE_ACCOUNT_PATH,
  scopes: ["https://www.googleapis.com/auth/cloud-platform",
              "https://www.googleapis.com/auth/generative-language",   
  ],
});

// Use the Gemini endpoint you intend to call
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

/**
 * Try to extract best-effort text from Gemini-style response.
 */
function extractTextFromGemini(data) {
  try {
    // 1) If top-level convenience field
    if (typeof data?.generatedText === "string" && data.generatedText.trim()) {
      return data.generatedText.trim();
    }

    // 2) candidates -> content -> parts[].text (common)
    if (Array.isArray(data?.candidates) && data.candidates.length > 0) {
      const first = data.candidates[0];
      // new style: first.content.parts[].text
      const parts = first?.content?.parts;
      if (Array.isArray(parts) && parts.length > 0) {
        const joined = parts.map((p) => p?.text ?? "").join("");
        if (joined.trim()) return joined.trim();
      }
      // some shapes: output_text
      if (typeof first?.output_text === "string" && first.output_text.trim()) {
        return first.output_text.trim();
      }
      // fallback to other keys inside candidate
      const maybe = first?.content?.parts?.[0]?.text || first?.outputText || first?.text;
      if (typeof maybe === "string" && maybe.trim()) return maybe.trim();
    }

    // 3) older or other shapes
    if (typeof data?.text === "string" && data.text.trim()) return data.text.trim();
    if (typeof data?.result?.content?.text === "string") return data.result.content.text.trim();

    // nothing
    return null;
  } catch (err) {
    console.warn("extractTextFromGemini error:", err);
    return null;
  }
}

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
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
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

    // Try parse JSON; if not parseable, return text as raw
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      // If remote returned HTML or non-JSON, forward that as error
      console.error("Gemini did not return JSON:", text.slice(0, 1000));
      return res.status(response.status || 500).json({ error: "Upstream returned non-JSON", rawText: text });
    }

    // Log the raw response to server console (helpful for debugging)
    console.log("Gemini response:", JSON.stringify(parsed, null, 2));

    // Extract best text
    const generatedText = extractTextFromGemini(parsed) || "";

    // Return consistent shape so frontend can always use data.generatedText
    return res.status(200).json({ generatedText, raw: parsed });
  } catch (err) {
    console.error("Gemini fetch error:", err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

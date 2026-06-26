import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { searchActiveListings, rankListings, DIGITAL_TAXONOMY_IDS } from "./etsy.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ETSY_API_KEY;

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/categories", (req, res) => {
  res.json(DIGITAL_TAXONOMY_IDS);
});

app.get("/api/search", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({
      error: "Missing ETSY_API_KEY. Copy .env.example to .env and add your key from etsy.com/developers.",
    });
  }

  const { keywords, category, minPrice, maxPrice, digitalOnly } = req.query;
  if (!keywords) {
    return res.status(400).json({ error: "keywords query param is required" });
  }

  try {
    const taxonomyId = DIGITAL_TAXONOMY_IDS[category] || null;
    const data = await searchActiveListings(API_KEY, {
      keywords,
      taxonomyId,
      minPrice,
      maxPrice,
      limit: 50,
    });
    const ranked = rankListings(data.results || [], {
      digitalOnly: digitalOnly !== "false",
    });
    res.json({ count: ranked.length, listings: ranked });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`listInspect running at http://localhost:${PORT}`);
});

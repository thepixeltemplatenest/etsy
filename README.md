# listInspect

A small local web app to research top-performing **digital product** listings on Etsy, using Etsy's official Open API v3.

## Setup

1. Get a free API key:
   - Go to https://www.etsy.com/developers/register
   - Create an app (no OAuth flow needed for this tool — it only uses public, key-only endpoints)
   - Copy the "Keystring"
2. Copy `.env.example` to `.env` and paste your key:
   ```
   ETSY_API_KEY=your_keystring_here
   ```
3. Install dependencies and run:
   ```
   npm install
   npm start
   ```
4. Open http://localhost:3000

## How it works

- Searches Etsy's public `listings/active` endpoint by keyword (and optional category/price filters).
- Etsy's API doesn't expose units-sold or revenue for shops you don't own, so results are ranked by **favorites** (`num_favorers`) as a sales proxy — the same heuristic third-party Etsy SEO tools use.
- "Digital only" filtering is best-effort: it uses the listing's digital/download flag when Etsy returns one, falling back to an unlimited-quantity heuristic (digital downloads have no physical stock limit).

## Notes / limitations

- Only uses Etsy's official API — no scraping, so it stays within Etsy's Terms of Service.
- Free Etsy API keys have a daily rate limit (10,000 req/day, 10 req/sec as of this writing) — plenty for personal research use.
- This is a research tool only; it doesn't connect to or modify your own shop.

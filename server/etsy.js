const ETSY_API_BASE = "https://api.etsy.com/v3/application";

// Digital-leaning Etsy taxonomy IDs (top-level categories where most listings
// are downloads/printables). Etsy's API has no single "is_digital" search
// filter, so we narrow by category here and double-check per-listing below.
export const DIGITAL_TAXONOMY_IDS = {
  any: null,
  "digital-prints": 1684,
  "patterns-how-to": 1635,
  "paper-party-digital": 1701,
  "craft-supplies-digital": 1267,
};

function buildSearchUrl({ keywords, taxonomyId, minPrice, maxPrice, sortOn, limit, offset }) {
  const url = new URL(`${ETSY_API_BASE}/listings/active`);
  if (keywords) url.searchParams.set("keywords", keywords);
  if (taxonomyId) url.searchParams.set("taxonomy_id", String(taxonomyId));
  if (minPrice != null) url.searchParams.set("min_price", String(minPrice));
  if (maxPrice != null) url.searchParams.set("max_price", String(maxPrice));
  url.searchParams.set("sort_on", sortOn || "score");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", String(limit || 50));
  url.searchParams.set("offset", String(offset || 0));
  return url;
}

export async function searchActiveListings(apiKey, params) {
  const url = buildSearchUrl(params);
  const res = await fetch(url, {
    headers: { "x-api-key": apiKey },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Etsy API error ${res.status}: ${body}`);
  }
  return res.json();
}

// The public Listing resource doesn't expose units-sold or revenue for shops
// you don't own, so favorites (num_favorers) is used as the sales-proxy
// signal, the same heuristic third-party Etsy SEO tools rely on.
export function rankListings(listings, { digitalOnly }) {
  const filtered = digitalOnly
    ? listings.filter((l) => isLikelyDigital(l))
    : listings;

  return filtered
    .map((l) => ({
      listing_id: l.listing_id,
      title: l.title,
      url: l.url,
      price: l.price ? l.price.amount / l.price.divisor : null,
      currency: l.price ? l.price.currency_code : null,
      shop_id: l.shop_id,
      tags: l.tags || [],
      taxonomy_id: l.taxonomy_id,
      num_favorers: l.num_favorers || 0,
      quantity: l.quantity,
      is_digital: isLikelyDigital(l),
    }))
    .sort((a, b) => b.num_favorers - a.num_favorers);
}

function isLikelyDigital(listing) {
  if (typeof listing.is_digital === "boolean") return listing.is_digital;
  if (listing.listing_type) return listing.listing_type === "download";
  // Unlimited quantity is a strong tell for downloads (no physical stock).
  return listing.quantity != null && listing.quantity > 999;
}

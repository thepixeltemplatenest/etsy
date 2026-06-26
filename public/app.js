const form = document.getElementById("search-form");
const statusEl = document.getElementById("status");
const tbody = document.querySelector("#results tbody");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const keywords = document.getElementById("keywords").value.trim();
  const category = document.getElementById("category").value;
  const minPrice = document.getElementById("minPrice").value;
  const maxPrice = document.getElementById("maxPrice").value;
  const digitalOnly = document.getElementById("digitalOnly").checked;

  const params = new URLSearchParams({ keywords, category, digitalOnly: String(digitalOnly) });
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);

  statusEl.textContent = "Searching...";
  tbody.innerHTML = "";

  try {
    const res = await fetch(`/api/search?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Search failed");

    statusEl.textContent = `${data.count} listing(s) found, ranked by favorites (sales proxy).`;
    data.listings.forEach((l, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${escapeHtml(l.title)}</td>
        <td>${l.price != null ? `${l.price.toFixed(2)} ${l.currency}` : "-"}</td>
        <td>${l.num_favorers}</td>
        <td>${l.is_digital ? "yes" : "no"}</td>
        <td>${l.tags.slice(0, 5).join(", ")}</td>
        <td><a href="${l.url}" target="_blank" rel="noopener">view</a></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
  }
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

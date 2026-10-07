/**
 * Client-side search over `/search-index.json`. The page HTML carries no
 * pre-rendered cards, so it stays small as the catalogue grows. Results are
 * rendered as static article cards (cover, title, time, category pill).
 */
interface SearchEntry {
  title: string;
  excerpt: string;
  href: string;
  category: string;
  totalTime: string;
  cover: string;
  coverAlt: string;
  searchText: string;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

(() => {
  const input = document.querySelector<HTMLInputElement>("[data-search-page-input]");
  const results = document.querySelector("[data-search-page-results]");
  const summary = document.querySelector("[data-search-page-summary]");
  if (!input || !results || !summary) return;

  let index: SearchEntry[] = [];

  const card = (entry: SearchEntry) => `
    <div role="listitem" class="fade-up c-dyn-item is-visible">
      <article class="recipe-card">
        <a href="${esc(entry.href)}" class="image-wrapper card c-inline-block">
          <img src="${esc(entry.cover)}" alt="${esc(entry.coverAlt)}" class="image" loading="lazy" decoding="async" />
          <div class="recipe-card-category--on-image c-dyn-list">
            <div role="list" class="c-dyn-items">
              <div role="listitem" class="c-dyn-item">
                <div class="category-tag-outer c-inline-block">
                  <div class="category-tag">${esc(entry.category)}</div>
                </div>
              </div>
            </div>
          </div>
        </a>
        <a href="${esc(entry.href)}" class="recipe-card-text-wrapper c-inline-block">
          <h3 class="heading s">${esc(entry.title)}</h3>
          <div class="recipe-card-time">
            <img src="/icons/icon-cook-time.svg" loading="lazy" alt="" class="recipe-icon small" />
            <div class="recipe-time small">${esc(entry.totalTime)}</div>
          </div>
        </a>
      </article>
    </div>`;

  const render = () => {
    const raw = new URLSearchParams(window.location.search).get("query") || input.value.trim();
    if (document.activeElement !== input) input.value = raw;
    const query = raw.toLowerCase().trim();
    const found = query ? index.filter((e) => e.searchText.includes(query)) : [];

    if (query) {
      const count = `${found.length} ${found.length === 1 ? "resultado" : "resultados"}`;
      const term = document.createElement("code");
      term.textContent = raw;
      summary.replaceChildren(`${count} para `, term);
    } else {
      summary.replaceChildren();
    }

    results.innerHTML = found.map(card).join("");
  };

  input.value = new URLSearchParams(window.location.search).get("query") || "";

  fetch("/search-index.json")
    .then((res) => (res.ok ? res.json() : []))
    .then((data) => {
      index = Array.isArray(data) ? (data as SearchEntry[]) : [];
      render();
    })
    .catch(() => {
      summary.textContent = "Não foi possível carregar a pesquisa. Tenta recarregar a página.";
    });

  input.addEventListener("input", render);
})();

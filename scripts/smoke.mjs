/**
 * Post-build smoke test: fails the release if the static output drifts
 * (missing page, missing JSON-LD, empty feed/index). Runs on `dist/`
 * so it catches Astro routing mistakes, not just TypeScript errors.
 *
 * Usage: npm run build && npm run test:smoke
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;
let failures = 0;

const check = (label, file, predicate) => {
  const path = join(dist, file);
  if (!existsSync(path)) {
    console.error(`FAIL ${label}: missing ${file}`);
    failures += 1;
    return;
  }
  const body = readFileSync(path, "utf8");
  if (predicate && !predicate(body)) {
    console.error(`FAIL ${label}: assertion failed in ${file}`);
    failures += 1;
    return;
  }
  console.log(`ok ${label}`);
};

check("home", "index.html", (b) => b.includes("Últimas receitas"));
check("recipes listing", "receitas/index.html", (b) => b.includes("recipe-card-list"));
check(
  "recipe JSON-LD",
  "receitas/batata-assada-com-alecrim/index.html",
  (b) => b.includes('"@type":"Recipe"') && b.includes("recipeIngredient"),
);
check("categories", "categorias/index.html", (b) => b.includes("cat-grid"));
check("search page", "pesquisar/index.html", (b) => b.includes("search-index.json"));
check("search index", "search-index.json", (b) => {
  try {
    const data = JSON.parse(b);
    return Array.isArray(data) && data.length > 0 && data[0].searchText;
  } catch {
    return false;
  }
});
check("sitemap", "sitemap.xml", (b) => b.includes("/receitas/") && b.includes("/categorias/"));
check("rss", "rss.xml", (b) => b.includes("<rss") && b.includes("<item>"));

if (failures > 0) {
  console.error(`\n${failures} smoke check(s) failed`);
  process.exit(1);
}
console.log("\nsmoke: all green");

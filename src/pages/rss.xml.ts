import { getCollection } from "astro:content";
import { siteConfig } from "@/config/site";
import { recipeHref, sortRecipes, visibleRecipes } from "@/lib/recipes";
import { absoluteUrl } from "@/lib/url";
import { escapeXml } from "@/lib/xml";

/** How many of the most recent recipes the feed carries. */
const FEED_LIMIT = 20;

/** RSS 2.0 requires RFC 822 dates, e.g. "Mon, 28 Sep 2026 00:00:00 GMT". */
const toRfc822 = (date: Date) => date.toUTCString();

export async function GET() {
  const recipes = sortRecipes(visibleRecipes(await getCollection("recipes")), "newest").slice(
    0,
    FEED_LIMIT,
  );

  const items = recipes
    .map((recipe) => {
      const url = absoluteUrl(recipeHref(recipe));
      const pubDate = recipe.data.date
        ? `\n  <pubDate>${toRfc822(recipe.data.date)}</pubDate>`
        : "";
      return `<item>
  <title>${escapeXml(recipe.data.title)}</title>
  <link>${escapeXml(url)}</link>
  <guid isPermaLink="true">${escapeXml(url)}</guid>${pubDate}
  <description>${escapeXml(recipe.data.excerpt)}</description>
</item>`;
    })
    .join("\n");

  const feedUrl = absoluteUrl("/rss.xml");
  // Derived from the newest item rather than the build clock, so rebuilding an
  // unchanged site doesn't tell readers the content changed. Omitted when no
  // recipe has a date, keeping builds deterministic.
  const newest = recipes.find((recipe) => recipe.data.date)?.data.date;
  const lastBuildDate = newest ? `\n  <lastBuildDate>${toRfc822(newest)}</lastBuildDate>` : "";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(siteConfig.name)}</title>
  <link>${escapeXml(siteConfig.siteUrl)}</link>
  <description>${escapeXml(siteConfig.description)}</description>
  <language>${escapeXml(siteConfig.language)}</language>
  <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />${lastBuildDate}
${items}
</channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

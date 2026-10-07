import { recipeHref, visibleRecipes } from "@/lib/recipes";
import { getCollection } from "astro:content";

/**
 * Static search index consumed by the search page via `fetch`.
 * Holds only listing fields so the page HTML stays small as the catalogue grows.
 */
export async function GET() {
  const recipes = visibleRecipes(await getCollection("recipes"));
  const index = recipes.map((recipe) => ({
    title: recipe.data.title,
    excerpt: recipe.data.excerpt,
    href: recipeHref(recipe),
    category: recipe.data.category,
    totalTime: recipe.data.totalTime,
    cover: recipe.data.cover,
    coverAlt: recipe.data.coverAlt,
    searchText: [recipe.data.title, recipe.data.excerpt, recipe.data.category]
      .join(" ")
      .toLowerCase(),
  }));

  return new Response(JSON.stringify(index), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}

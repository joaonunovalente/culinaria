import { getCollection, type CollectionEntry } from "astro:content";
import { categories, categorySlug, type Category } from "@/config/categories";

export type Recipe = CollectionEntry<"recipes">;
export type { Category };
export { categories, categorySlug };

/**
 * Automatic order: oldest `date` first (creation order). A new recipe only
 * needs a `date` in its frontmatter to slot in — no manual list to update.
 * Recipes without `date` go last, tie-broken by slug for stability.
 */
export const byPublishOrder = (a: Recipe, b: Recipe) => {
  const da = a.data.date?.getTime() ?? Number.POSITIVE_INFINITY;
  const db = b.data.date?.getTime() ?? Number.POSITIVE_INFINITY;
  if (da !== db) return da - db;
  return recipeSlug(a).localeCompare(recipeSlug(b));
};

/**
 * Newest first, which is what feed readers assume. Recipes without a `date`
 * keep their CMS order and sort last. Single source for RSS ordering so the
 * feed can't drift from listing order logic.
 */
export const byNewestFirst = (a: Recipe, b: Recipe) => {
  const aTime = a.data.date?.getTime();
  const bTime = b.data.date?.getTime();
  if (aTime === undefined) return bTime === undefined ? 0 : 1;
  if (bTime === undefined) return -1;
  return bTime - aTime;
};

export type RecipeSort = "publish" | "newest";

export const sortRecipes = (recipes: Recipe[], order: RecipeSort = "publish") =>
  [...recipes].sort(order === "newest" ? byNewestFirst : byPublishOrder);

export const categoryHref = (category: string) => `/categorias/${categorySlug(category)}/`;

export const recipeSlug = (recipe: Recipe) => recipe.id.replace(/\.[^.]+$/, "");

export const recipeHref = (recipe: Recipe) => `/receitas/${recipeSlug(recipe)}/`;

/** Standalone print sheet: same recipe, laid out for paper / "save as PDF". */
export const printRecipeHref = (recipe: Recipe) => `/receitas/${recipeSlug(recipe)}/imprimir/`;

/** Shared `getStaticPaths` for `/receitas/[slug]/` (drafts included, legacy parity). */
export const getRecipeStaticPaths = async () => {
  const recipes = await getCollection("recipes");
  return recipes.map((recipe) => ({
    params: { slug: recipeSlug(recipe) },
    props: { recipe },
  }));
};

/** Shared `getStaticPaths` for the print sheet (only visible recipes). */
export const getPrintStaticPaths = async () => {
  const recipes = visibleRecipes(await getCollection("recipes"));
  return recipes.map((recipe, index) => ({
    params: { slug: recipeSlug(recipe) },
    props: { recipe, index },
  }));
};

export const visibleRecipes = (recipes: Recipe[]) =>
  recipes.filter((recipe) => !recipe.data.draft).sort(byPublishOrder);

export const getRecipeBySlug = (recipes: Recipe[], slug: string) =>
  recipes.find((recipe) => recipeSlug(recipe) === slug);

export const getFeatured = (recipes: Recipe[], limit = 1) =>
  visibleRecipes(recipes)
    .filter((recipe) => recipe.data.featured)
    .slice(0, limit);

/** Non-featured recipes in publish order. */
export const getListedRecipes = (recipes: Recipe[]) =>
  visibleRecipes(recipes).filter((recipe) => !recipe.data.featured);

/**
 * "Mais receitas" batches on the listing page: how many cards show before the
 * first click, and how many each click adds. 3 is one full row of the
 * 3-column card grid (2 columns on tablet, 1 on mobile), so a reveal never
 * leaves a half-empty row behind.
 */
export const RECIPES_BATCH = 3;
export const RECIPES_BATCH_STEP = 3;

export const getRecipesByCategory = (recipes: Recipe[], category: string) =>
  visibleRecipes(recipes).filter((recipe) => recipe.data.category === category);

/** Explicit per-recipe "Other recipes" sidebar, matching the legacy pages. */
export const getRelated = (recipes: Recipe[], current: Recipe) =>
  (current.data.related ?? [])
    .map((slug) => getRecipeBySlug(recipes, slug))
    .filter((recipe): recipe is Recipe => recipe !== undefined);

/** Categories in configured order, with recipe counts. Empty ones are dropped. */
export const getCategoryList = (recipes: Recipe[]) => {
  const visible = visibleRecipes(recipes);

  return categories
    .map((category) => ({
      name: category,
      slug: categorySlug(category),
      count: visible.filter((recipe) => recipe.data.category === category).length,
    }))
    .filter((entry) => entry.count > 0);
};

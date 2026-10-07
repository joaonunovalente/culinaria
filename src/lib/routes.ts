/**
 * Non-`noindex` static routes for the sitemap. Single source so a new page
 * can't be forgotten in `sitemap.xml.ts`. Search, 401/404 and print sheets
 * are internal and deliberately absent.
 */
export const sitemapStaticRoutes = [
  "/",
  "/receitas/",
  "/categorias/",
  "/sobre/",
  "/contacto/",
  "/politica-de-privacidade/",
  "/registo-de-alteracoes/",
] as const;

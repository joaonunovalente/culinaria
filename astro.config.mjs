// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { unified } from "@astrojs/markdown-remark";
import rehypeSlug from "rehype-slug";
import { siteConfig } from "./src/config/site.ts";
import { codeThemes, codeDefaultColor } from "./src/config/code.ts";

import mdx from "@astrojs/mdx";

const shikiConfig = /** @type {const} */ ({
  themes: codeThemes,
  defaultColor: codeDefaultColor,
});

export default defineConfig({
  site: siteConfig.siteUrl,
  /**
   * Every route and category name was translated to pt-PT, so the English
   * paths stopped resolving. These keep them working. Static builds emit a
   * `<meta http-equiv="refresh">` page rather than a real 301 — add
   * host-level redirects if you ever need the status code.
   */
  redirects: {
    // Page routes
    "/recipes": "/receitas",
    "/categories": "/categorias",
    "/about": "/sobre",
    "/contact": "/contacto",
    "/search": "/pesquisar",
    "/privacy-policy": "/politica-de-privacidade",
    // Page 2 of the recipe listing is gone: every recipe now lives on
    // /receitas/, and "Mais receitas" reveals the rest.
    "/receitas/2": "/receitas",
    // Print sheet moved under its recipe: /imprimir/:slug -> /receitas/:slug/imprimir
    "/imprimir/[slug]": "/receitas/[slug]/imprimir",
    // Category archives (the slug is derived from the category name)
    "/categories/entrees": "/categorias/entradas",
    "/categories/breakfast": "/categorias/pequeno-almoco",
    "/categories/lunch": "/categorias/almoco",
    "/categories/desserts": "/categorias/sobremesas",
    "/categories/sides": "/categorias/guarnicoes",
    "/categories/drinks": "/categorias/bebidas",
    // Renamed category: keep the old PT slug working
    "/categorias/acompanhamentos": "/categorias/guarnicoes",
    // The one recipe that was published under an English slug
    "/recipes/pineapple-smoked-jackfruit-pizza": "/receitas/pizza-de-ananas-e-jaca-fumada",
  },
  integrations: [mdx()],
  markdown: {
    processor: unified({
      // Disabled: the legacy template uses straight quotes/apostrophes
      // (e.g. "you'll"), and smartypants would rewrite them to curly ones.
      smartypants: false,
      rehypePlugins: [rehypeSlug],
    }),
    shikiConfig,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

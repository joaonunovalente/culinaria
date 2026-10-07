import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { categories } from "@/config/categories";

const recipes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/recipes" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    /** Publication date. Drives `<pubDate>` and the newest-first order in the RSS feed. */
    date: z.coerce.date().optional(),
    /** Must match one of the entries in src/config/categories.ts. */
    category: z.enum(categories),
    /** Total time label shown on cards, e.g. "30 minutos". */
    totalTime: z.string(),
    prepTime: z.string().optional(),
    cookTime: z.string().optional(),
    /** Oven setting shown on the print sheet metabar, e.g. "230 °C". */
    oven: z.string().optional(),
    /** Difficulty shown on the print sheet metabar, e.g. "Fácil". */
    difficulty: z.string().optional(),
    servings: z.string().optional(),
    servingsUnit: z.string().default("pessoas"),
    /** Local path under /images, e.g. "/images/foo.webp". */
    cover: z.string(),
    coverAlt: z.string(),
    ingredients: z
      .array(
        z.object({
          heading: z.string().nullable().default(null),
          items: z.array(z.string()),
        }),
      )
      .default([]),
    directions: z
      .array(
        z.object({
          heading: z.string().nullable().default(null),
          items: z.array(z.string()),
        }),
      )
      .default([]),
    /** Slugs for the "Other recipes" sidebar, in legacy order. */
    related: z.array(z.string()).default([]),
    /** Whether the recipe has the legacy YouTube embed. */
    video: z.boolean().default(false),
    /** Surfaces the recipe in the home "Featured Recipe" slot. */
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { recipes };

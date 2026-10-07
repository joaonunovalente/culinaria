import type { Recipe } from "@/lib/recipes";
import QRCode from "qrcode";

export const PRINT_SHORT_URL = "Culinaria.JoaoNunoValente.com";

export interface PrintSection {
  heading: string | null;
  items: string[];
}

export interface PrintPayload {
  title: string;
  excerpt: string;
  category: string;
  totalTime: string;
  prepTime: string | null;
  cookTime: string | null;
  servings: string | null;
  servingsUnit: string;
  cover: string;
  coverAlt: string;
  ingredients: PrintSection[];
  directions: PrintSection[];
  authorName: string;
  shortUrl: string;
}

export type IngredientBlock = { kind: "group"; text: string } | { kind: "item"; text: string };

export interface StepBlock {
  n: number;
  head: string | null;
  text: string;
}

export function formatFichaNo(index: number): string {
  return String(index + 1).padStart(3, "0");
}

export function formatForno(
  oven: string | null | undefined,
  cookTime: string | null | undefined,
): string | null {
  if (oven && cookTime) return `${oven} · ${cookTime}`;
  return oven ?? cookTime ?? null;
}

/** QR code SVG (fundo branco, pronto a imprimir) para o URL canónico. */
export async function qrSvgFor(url: string): Promise<string | null> {
  try {
    return await QRCode.toString(url, {
      type: "svg",
      margin: 1,
      width: 112,
      color: { dark: "#1b2629", light: "#ffffff" },
    });
  } catch {
    return null;
  }
}

export function buildPrintPayload(recipe: Recipe, authorName: string): PrintPayload {
  return {
    title: recipe.data.title,
    excerpt: recipe.data.excerpt,
    category: recipe.data.category,
    totalTime: recipe.data.totalTime,
    prepTime: recipe.data.prepTime ?? null,
    cookTime: recipe.data.cookTime ?? null,
    servings: recipe.data.servings ?? null,
    servingsUnit: recipe.data.servingsUnit ?? "pessoas",
    cover: recipe.data.cover,
    coverAlt: recipe.data.coverAlt,
    ingredients: recipe.data.ingredients,
    directions: recipe.data.directions,
    authorName,
    shortUrl: PRINT_SHORT_URL,
  };
}

export interface PrintMetaField {
  key: string;
  label: string;
  value: string;
}

/** Sidebar fields for the print settings panel, derived from one recipe. */
export function buildPrintMetaFields(recipe: Recipe): PrintMetaField[] {
  const forno = formatForno(recipe.data.oven, recipe.data.cookTime);
  const servingsText =
    recipe.data.servings != null
      ? `${recipe.data.servings} ${recipe.data.servingsUnit ?? "pessoas"}`
      : null;

  return [
    { key: "totaltime", label: "Tempo total", value: recipe.data.totalTime },
    recipe.data.prepTime ? { key: "prep", label: "Preparação", value: recipe.data.prepTime } : null,
    forno ? { key: "forno", label: "Forno", value: forno } : null,
    servingsText ? { key: "servings", label: "Doses", value: servingsText } : null,
    recipe.data.difficulty
      ? { key: "difficulty", label: "Dificuldade", value: recipe.data.difficulty }
      : null,
  ].filter((field): field is PrintMetaField => field !== null);
}

export function flattenIngredients(sections: PrintSection[]): IngredientBlock[] {
  const out: IngredientBlock[] = [];
  for (const sec of sections) {
    if (sec.heading && sec.items.length) out.push({ kind: "group", text: sec.heading });
    for (const item of sec.items) out.push({ kind: "item", text: item });
  }
  return out;
}

export function flattenSteps(sections: PrintSection[]): StepBlock[] {
  const out: StepBlock[] = [];
  let n = 0;
  for (const sec of sections) {
    sec.items.forEach((step, i) => {
      n += 1;
      out.push({ n, head: i === 0 ? sec.heading : null, text: step });
    });
  }
  return out;
}

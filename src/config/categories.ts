/**
 * The site's categories. Every recipe belongs to exactly one of these.
 * Order matters: it is the order used on the home page and categories index.
 */
export const categories = [
  "Entradas",
  "Pequeno-almoço",
  "Almoço",
  "Sobremesas",
  "Guarnições",
  "Bebidas",
] as const;

export type Category = (typeof categories)[number];

/**
 * Slug for a category name. Accented Latin is folded to ASCII rather than
 * dropped, so a Portuguese name keeps its accents on screen and still yields a
 * clean URL ("Almoço" -> "almoco", not "almo").
 */
export const categorySlug = (category: string) =>
  category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/** Tag colours. Foreground values are darkened to meet WCAG AA (4.5:1) against their backgrounds. */
export const categoryStyles: Record<Category, { color: string; background: string }> = {
  Entradas: { color: "#4a6f1a", background: "#f0f5c4" },
  "Pequeno-almoço": { color: "#3c3a8f", background: "#efedfa" },
  Almoço: { color: "#186e6e", background: "#e5f7f3" },
  Sobremesas: { color: "#326e92", background: "#e8f5fa" },
  Guarnições: { color: "#9a4b00", background: "#feefc9" },
  Bebidas: { color: "#b03228", background: "#ffeae3" },
};

const FALLBACK_CATEGORY_STYLE = { color: "#333", background: "#eee" };

/** Single lookup for tag colours, so cards and archive heroes can't drift apart. */
export const getCategoryStyle = (category: string) =>
  (categoryStyles as Record<string, { color: string; background: string }>)[category] ??
  FALLBACK_CATEGORY_STYLE;

/** One line per category, shown on its archive page and in listings. */
export const categoryDescriptions: Record<Category, string> = {
  Entradas: "Pratos principais à base de plantas, desde pizzas até ensopados de cozimento lento.",
  "Pequeno-almoço":
    "Manhãs sem pressa, torradas de três maneiras, panquecas e torradas à francesa.",
  Almoço: "Saladas frescas e bowls para o meio do dia.",
  Sobremesas: "Cupcakes, parfaits e outros finais doces.",
  Guarnições: "Batatas fritas, abacates e tudo o que acompanha.",
  Bebidas: "Mimosas, cocktails e outras bebidas para saborear.",
};

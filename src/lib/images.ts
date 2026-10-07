/**
 * Intrinsic dimensions for `public/images/*`, measured once so every `<img>`
 * can carry `width`/`height` and avoid CLS. Covers are 1200px wide except
 * legacy 2000px exports; portraits keep their ratio via CSS `object-fit`.
 */
const DIMENSIONS: Record<string, { width: number; height: number }> = {
  "about-photo-1.webp": { width: 1000, height: 1182 },
  "about-photo-2.webp": { width: 800, height: 559 },
  "about-photo-3.webp": { width: 800, height: 559 },
  "about-photo-4.webp": { width: 800, height: 559 },
  "about-photo.jpg": { width: 1000, height: 1182 },
  "contact-photo.webp": { width: 1001, height: 1183 },
  "batata-assada-com-alecrim.webp": { width: 1200, height: 800 },
  "bolo-de-chocolate-humido-vegano.webp": { width: 1200, height: 882 },
  "bowl-mediterranico-de-quinoa.webp": { width: 1200, height: 800 },
  "cocktail-de-frutas-vermelhas.webp": { width: 1200, height: 727 },
  "lasanha-de-beringela-a-bolonhesa-vegana.webp": { width: 1200, height: 801 },
  "panquecas-americanas-de-aveia.webp": { width: 1200, height: 1450 },
  "pizza-de-ananas-e-jaca-fumada.webp": { width: 2000, height: 1283 },
};

const FALLBACK = { width: 1200, height: 800 };

/** Intrinsic size for a `/images/*` path, falling back to 3:2. */
export const imageSize = (src: string) => {
  const base = src.split("/").pop() ?? src;
  return DIMENSIONS[base] ?? FALLBACK;
};

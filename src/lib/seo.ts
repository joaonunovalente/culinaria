import { siteConfig } from "@/config/site";

/**
 * Título SEO canónico: página inicial usa o título completo,
 * páginas internas usam `Página | Culinária`.
 * Idempotente — nunca duplica o sufixo se o chamador já o incluiu.
 */
export const buildPageTitle = (pageTitle?: string | null): string => {
  if (!pageTitle) return siteConfig.title;

  const normalized = pageTitle.trim().replace(/\s+/g, " ");
  if (!normalized) return siteConfig.title;

  // "Culinária" sozinho ou o título da home não ganham sufixo.
  if (normalized === siteConfig.name || normalized === siteConfig.title) {
    return siteConfig.title;
  }

  const suffix = `${siteConfig.titleSeparator} ${siteConfig.name}`;
  // Já sufixado (qualquer capitalização) — devolver como está.
  if (normalized.toLowerCase().endsWith(suffix.toLowerCase())) return normalized;
  // Defesa contra chamadas antigas com o título completo embutido:
  // "Sobre | Culinária | Caderno..." — não voltar a sufixar.
  if (normalized.toLowerCase().includes(suffix.toLowerCase())) return normalized;

  return `${normalized} ${suffix}`;
};

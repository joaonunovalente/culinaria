import { categories, categorySlug } from "@/config/categories";

const siteName = "Culinária";
const siteTagline = "Caderno de receitas de João Nuno Valente";

export const siteConfig = {
  name: siteName,
  tagline: siteTagline,
  /** Separador usado entre o título da página e o nome do site. */
  titleSeparator: "|",
  /** Título da página inicial. Páginas internas usam `Página | Culinária` via `buildPageTitle`. */
  title: `${siteName} | ${siteTagline}`,
  description:
    "Culinária é o caderno de receitas de João Nuno Valente, com receitas simples do dia-a-dia e algumas sobremesas.",
  siteUrl: "https://culinaria.joaonunovalente.com",
  authorName: "João Nuno Valente",
  email: "hello@joaonunovalente.com",
  language: "pt-PT",
  dateLocale: "pt-PT",
  locale: "pt_PT",
  socialImage: "/og-image.jpg",
};

/** Social icon row, rendered in the header and the footer. */
export const socials = [
  { label: "Bio", href: "https://bio.joaonunovalente.com/", icon: "/icons/icon-linktree.svg" },
  {
    label: "Github",
    href: "https://github.com/joaonunovalente/culinaria",
    icon: "/icons/icon-github.svg",
  },
  { label: "RSS", href: "/rss.xml", icon: "/icons/icon-rss.svg" },
];

/** Press-logo row, rendered on the home and about pages. */
export const featuredIn = {
  enabled: false,
  title: "Destaque em",
  items: [
    {
      label: "The New York Times",
      href: "https://www.nytimes.com/",
      icon: "/logos/logo-nyt.svg",
    },
    { label: "VegNews", href: "https://vegnews.com/", icon: "/logos/logo-vegnews.svg" },
    { label: "BuzzFeed", href: "https://www.buzzfeed.com/", icon: "/logos/logo-buzzfeed.svg" },
    { label: "Huffpost", href: "https://www.huffpost.com/", icon: "/logos/logo-huffpost.svg" },
    {
      label: "Forks Over Knives",
      href: "https://www.forksoverknives.com/",
      icon: "/logos/logo-forks-over-knives.svg",
    },
  ],
};

/** Everything the site header renders. */
export const header = {
  navigation: [
    { label: "Receitas", href: "/receitas/" },
    { label: "Sobre", href: "/sobre/" },
    { label: "Contacto", href: "/contacto/" },
  ],
};

/** Everything the footer renders: link columns and the bottom credit row. */
export const footer = {
  navigation: {
    title: "Explorar",
    links: [
      { label: "Receitas", href: "/receitas/" },
      { label: "Sobre", href: "/sobre/" },
      { label: "Contacto", href: "/contacto/" },
      // { label: "Privacidade", href: "/politica-de-privacidade/" },
    ],
  },
  /** Derived from the canonical category list so the footer can never drift from it. */
  categoryNavigation: {
    title: "Categorias",
    columns: true,
    links: categories.map((category) => ({
      label: category,
      href: `/categorias/${categorySlug(category)}/`,
    })),
  },
  credits: {
    developerName: "João Nuno Valente",
    developerUrl: "https://joaonunovalente.com",
  },
};

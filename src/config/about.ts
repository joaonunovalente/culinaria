/**
 * The about page: copy and images for `/sobre/`.
 *
 * Only the author name stays in `siteConfig` (`src/config/site.ts`) as
 * global identity, rendered as `{greetingPrefix} {siteConfig.authorName}!`.
 * Everything else — including the two bio paragraphs — lives here.
 * The press-logo row is still driven by `featuredIn` in `src/config/site.ts`.
 */

export interface AboutFact {
  image: string;
  imageAlt: string;
  title: string;
  text: string;
}

export const about = {
  // Visibility -----------------------------------------------------------
  // Set any of these to false to hide that section from `/sobre/`.
  // Hiding `profile` also hides its press-logo row. The quote band has its
  // own switch at `quote.enabled` below.
  /** Hero title + intro paragraph. */
  showHero: true,
  /** Profile image + author greeting/bio. */
  showProfile: true,
  /** The three-card "A little more about me" grid. */
  showFacts: true,

  // Hero ---------------------------------------------------------------
  heading: "Sobre mim",
  /** Single intro paragraph under the heading. Also feeds the page meta and the "Sobre mim" card in the recipe sidebar. */
  intro:
    "Sou o João Nuno e tive de aprender a cozinhar sozinho em Itália. Hoje em dia, faço-o com todo o gosto.",

  // Profile ------------------------------------------------------------
  greetingPrefix: "Olá, o meu nome é",
  /** Exactly two paragraphs under the greeting. */
  bio: [
    "Sou o João Nuno, alguém que teve que aprender a cozinhar sozinho em Itália. Faço receitas simples e saborosas que depois partilho aqui.",
    "Este espaço serve primeiramente para registar as receitas que faço. Espero que outras pessoas possam tirar partido delas e que, quem sabe, se inspirem a cozinhar também.",
  ] as [string, string],
  /**
   * Call-to-action under the bio. Set `buttonLabel` to "" to hide it.
   */
  buttonLabel: "Entrar em contacto",
  buttonHref: "/contacto/",
  /**
   * Secondary action beside the main button. Empty
   * `secondaryButtonLabel` hides it.
   */
  secondaryButtonLabel: "Ver receitas",
  secondaryButtonHref: "/receitas/",
  profileImage: "/images/about-photo-1.webp",
  profileImageAlt: "Mulher a cozinhar na cozinha",

  // Facts --------------------------------------------------------------
  /** Heading above the three cards. The grid is fixed at exactly three cards. */
  factsHeading: "Um pouco mais sobre mim",
  facts: [
    {
      image: "/images/about-photo-2.webp",
      imageAlt: "Mulher a cozinhar na cozinha",
      title: "Sabor de Itália",
      text: "Dedico-me principalmente à cozinha italiana, recriando massas, molhos e sobremesas tradicionais.",
    },
    {
      image: "/images/about-photo-3.webp",
      imageAlt: "Curgete num tabuleiro de forno",
      title: "Ingredientes frescos",
      text: "Gosto de usar ingredientes frescos de época e básicos para criar as minhas receitas.",
    },
    {
      image: "/images/about-photo-4.webp",
      imageAlt: "Mulher a cozinhar na cozinha",
      title: "Paixão por chocolate",
      text: "Tenho uma fraqueza: sobremesas com chocolate! Gosto de partilhar receitas doces fáceis de fazer.",
    },
  ] as [AboutFact, AboutFact, AboutFact],

  // Quote --------------------------------------------------------------
  quote: {
    /** Set to false to hide the quote band at the bottom of the page. */
    enabled: false,
    text: "A boa comida não precisa de manual — só de ingredientes frescos, um pouco de curiosidade e alguém com quem a partilhar.",
  },
};

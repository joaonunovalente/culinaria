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
  showFacts: false,

  // Hero ---------------------------------------------------------------
  heading: "Sobre mim",
  /** Single intro paragraph under the heading. Also feeds the page meta and the "Sobre mim" card in the recipe sidebar. */
  intro:
    "Sou o João Nuno. Aprendi a cozinhar a viver em Itália e registo aqui as receitas que faço.",

  // Profile ------------------------------------------------------------
  greetingPrefix: "Olá, o meu nome é",
  /** Exactly two paragraphs under the greeting. */
  bio: [
    "Sou o João Nuno. Vivi um ano em Itália e foi aí que aprendi a cozinhar, por necessidade e depois por hábito.",
    "Cozinho sobretudo cozinha italiana simples e algumas sobremesas. Este site é o meu caderno de receitas: registo o que faço para poder repetir.",
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
  factsHeading: "O que cozinho",
  facts: [
    {
      image: "/images/about-photo-2.webp",
      imageAlt: "Mulher a cozinhar na cozinha",
      title: "Cozinha italiana",
      text: "Massas, molhos e pratos do dia-a-dia, com base na cozinha italiana.",
    },
    {
      image: "/images/about-photo-3.webp",
      imageAlt: "Curgete num tabuleiro de forno",
      title: "Ingredientes de época",
      text: "Receitas simples, com ingredientes fáceis de encontrar e da estação.",
    },
    {
      image: "/images/about-photo-4.webp",
      imageAlt: "Mulher a cozinhar na cozinha",
      title: "Chocolate",
      text: "Sobremesas simples, muitas com chocolate. São as que mais repito.",
    },
  ] as [AboutFact, AboutFact, AboutFact],

  // Quote --------------------------------------------------------------
  quote: {
    /** Set to false to hide the quote band at the bottom of the page. */
    enabled: false,
    text: "A boa comida não precisa de manual — só de ingredientes frescos, um pouco de curiosidade e alguém com quem a partilhar.",
  },
};

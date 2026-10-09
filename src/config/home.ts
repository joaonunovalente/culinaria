/**
 * The homepage body: the static copy and switches for the blocks that sit
 * around the recipe content.
 *
 * Recipe content itself comes from the `recipes` collection, not from
 * config. The about teaser below is the homepage's own block — it is not
 * the `/sobre/` page, which is driven by the `about` export in
 * @/config/about — so its copy is deliberately separate and can be
 * shorter and more pitched than the full bio.
 */

export const home = {
  // About teaser ---------------------------------------------------------
  // The closing block above the press-logo row. Set `enabled` to false to
  // drop it from the homepage; the press-logo row below is independent and
  // is driven by `featuredIn` in @/config/site.
  about: {
    /** Set to false to hide the whole teaser from the homepage. */
    enabled: true,

    heading: "Um pouco sobre mim",
    /** Paragraphs under the heading, in order. */
    text: [
      "Vivi um ano em Itália e foi aí que aprendi a cozinhar, por necessidade e depois por hábito.",
      "Este sítio é o meu caderno de receitas onde registo o que faço para poder repetir.",
    ],

    /** Primary call to action. Set `buttonLabel` to "" to hide it. */
    buttonLabel: "Sobre mim",
    buttonHref: "/sobre/",
    /**
     * Secondary action beside the main button. Empty
     * `secondaryButtonLabel` hides it.
     */
    secondaryButtonLabel: "Ver receitas",
    secondaryButtonHref: "/receitas/",

    image: "/images/about-photo.jpg",
    imageAlt: "Cozinhar na cozinha junto ao fogão",
  },
};

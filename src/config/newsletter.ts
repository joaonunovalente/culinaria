/**
 * The newsletter signup. Rendered by NewsletterSignup in the homepage
 * body and in the footer band.
 */
export const newsletter = {
  bodyHeading: "Subscreve a minha newsletter semanal!",
  bodyText:
    "E-mails semanais com as minhas receitas mais recentes, dicas e truques de cozinha e recomendações de produtos!",
  footerHeading: "Recebe receitas directamente na tua caixa de entrada!",

  // Placement -------------------------------------------------------------
  /** Master switch for both placements below. */
  enabled: false,
  /** The newsletter section in the homepage body. */
  showInBody: true,
  /** The newsletter band at the top of the footer, on every page. */
  showInFooter: true,

  // Provider --------------------------------------------------------------
  /**
   * Where the form posts. Leave this EMPTY for demo mode: the form then
   * validates locally and shows the inline success message, and no
   * submissions are collected anywhere. Set it to your provider's embed
   * endpoint to go live.
   */
  action: "",
  method: "post" as const,
  /**
   * How a live submit behaves. Only read when `action` is set.
   *
   * - "native": the browser posts and the provider shows its own
   *   confirmation page. Works with every provider, including Mailchimp.
   * - "ajax": fetch the endpoint and show the inline success panel, so the
   *   visitor stays on the page. Needs a provider that sends CORS headers
   *   (Buttondown, MailerLite). Mailchimp's endpoint returns JSONP with no
   *   CORS headers, so it must stay "native".
   */
  submitMode: "native" as "native" | "ajax",
  /** After a successful "ajax" submit, send the visitor here. Empty = stay. */
  successUrl: "",
  /** The email input's name attribute, which must match the provider. */
  emailFieldName: "email",
  /**
   * The name input's name attribute. IMPORTANT: most providers expect their
   * own spelling -- Mailchimp and Kit want "FNAME", Kit's API wants
   * "first_name" -- and silently discard a field they do not recognise, so a
   * name collected under the wrong key is lost without any error. Change
   * this to match your provider, or set it to "" to drop the name field
   * entirely.
   */
  nameFieldName: "name",
  /**
   * Hidden fields some providers require. Mailchimp, for example, needs the
   * `u` and `id` values from your embed code:
   *   extraFields: { u: "abc123", id: "def456" }
   */
  extraFields: {} as Record<string, string>,
  /**
   * Name of the anti-spam honeypot field, left in the markup but hidden from
   * people. Bots fill it in and the script drops the submission; humans never
   * see it. Set it to "" to turn the honeypot off. Providers with a built-in
   * honeypot (Mailchimp) do not need this.
   */
  honeypotFieldName: "botcheck",
};

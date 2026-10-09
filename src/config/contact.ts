/**
 * The contact form: copy, visibility switch and backend settings.
 */
export const contact = {
  // Copy ------------------------------------------------------------------
  // The field placeholders, the button label and the wait/success/error
  // messages live in the /contacto/ page itself, next to the markup they
  // render.
  heading: "Contacto",
  intro:
    "Para entrares em contacto comigo, preenche o formulário abaixo. Podes também usar o email {{siteConfig.email}}.",

  // Visibility ------------------------------------------------------------
  /** Master switch for the contact form and its nav links. */
  enabled: true,

  // Provider --------------------------------------------------------------
  /**
   * Where the form posts. Leave this EMPTY for demo mode: the form then
   * validates locally and shows the inline success message, and no
   * submissions are collected anywhere. Set it to your form backend's
   * endpoint (e.g. Formspree, Basin, Web3Forms, FormSubmit) to go live.
   */
  action: "https://formsubmit.co/hello@joaonunovalente.com",
  method: "post" as const,
  /**
   * How a live submit behaves. Only read when `action` is set.
   *
   * - "native": the browser posts and the backend shows its own
   *   confirmation page. Works with every provider.
   * - "ajax": fetch the endpoint and show the inline success panel, so the
   *   visitor stays on the page. Needs a backend that sends CORS headers
   *   and accepts cross-origin form posts.
   */
  submitMode: "ajax" as "native" | "ajax",
  /** After a successful "ajax" submit, send the visitor here. Empty = stay. */
  successUrl: "",
  /** The name input's name attribute, which must match the provider. */
  nameFieldName: "name",
  /** The email input's name attribute, which must match the provider. */
  emailFieldName: "email",
  /** The message textarea's name attribute, which must match the provider. */
  messageFieldName: "message",
  /**
   * Hidden fields some backends require. FormSubmit supports:
   * - `_subject`: email subject
   * - `_captcha`: set to "false" to disable
   * - `_format`: "json" para respostas AJAX
   * - `_redirect`: "false" para não redirecionar
   */
  extraFields: {
    _subject: "Nova mensagem do site Culinária",
    _captcha: "false",
    _format: "json",
    _redirect: "false",
  } as Record<string, string>,
};

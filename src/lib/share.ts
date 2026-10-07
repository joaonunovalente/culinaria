import { absoluteUrl } from "@/lib/url";

export interface ShareTarget {
  /** Page being shared. Site-relative paths are resolved against `siteUrl`. */
  url: string;
  /** Headline the network pre-fills. */
  title: string;
  /** Optional summary, used for Pinterest and the email body. */
  description?: string;
  /** Site-relative or absolute image path, e.g. "/images/foo.webp". */
  image?: string;
}

export interface ShareLink {
  /** Accessible name, e.g. "Facebook". */
  label: string;
  /** Full share URL, ready for an `href`. */
  href: string;
  /** Icon path under `/icons`. */
  icon: string;
}

/**
 * Share intents for the "Share recipe" row. Every query parameter is encoded,
 * and the link is a plain `href` — the networks open their own compose window
 * when the link is followed, so no client-side script is involved.
 *
 * Email is a `mailto:` and therefore opens in the same tab, unlike the network
 * links which open in a new one to keep the recipe in place.
 */
export const shareLinks = ({ url, title, description, image }: ShareTarget): ShareLink[] => {
  const page = absoluteUrl(url);
  const encodedPage = encodeURIComponent(page);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description ?? "");
  const encodedImage = image ? encodeURIComponent(absoluteUrl(image)) : "";

  // Pinterest only prefills the media and description when both are present.
  const pinterest =
    `https://www.pinterest.com/pin/create/button/?url=${encodedPage}` +
    (encodedImage ? `&media=${encodedImage}` : "") +
    (encodedDescription ? `&description=${encodedDescription}` : "");

  const mailto =
    `mailto:?subject=${encodedTitle}` +
    `&body=${encodeURIComponent([description, page].filter(Boolean).join("\n\n"))}`;

  // WhatsApp takes a single free-text field rather than separate parameters, so
  // the title and link go in one message. `wa.me` opens the native app on a
  // phone and WhatsApp Web on a desktop.
  const whatsapp = `https://wa.me/?text=${encodeURIComponent([title, page].filter(Boolean).join("\n"))}`;

  return [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedPage}`,
      icon: "/icons/icon-facebook.svg",
    },
    { label: "Pinterest", href: pinterest, icon: "/icons/icon-pinterest.svg" },
    { label: "WhatsApp", href: whatsapp, icon: "/icons/icon-whatsapp.svg" },
    { label: "E-mail", href: mailto, icon: "/icons/icon-email.svg" },
  ];
};

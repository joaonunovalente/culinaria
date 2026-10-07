import { header, footer } from "@/config/site";
import { contact } from "@/config/contact";

export interface NavLink {
  label: string;
  href: string;
}

const CONTACT_HREF = "/contacto/";

/** Header navigation, hiding the contact entry when the form is disabled. */
export const getHeaderNavigation = (): NavLink[] =>
  header.navigation.filter((item) => contact.enabled || item.href !== CONTACT_HREF);

/** Footer "Explorar" links, kept in sync with the header rule above. */
export const getFooterNavigation = (): NavLink[] =>
  footer.navigation.links.filter((link) => contact.enabled || link.href !== CONTACT_HREF);

/** True when `href` matches the current page (section-aware, except `/`). */
export const isCurrentPath = (currentPath: string, href: string) =>
  currentPath === href || (href !== "/" && currentPath.startsWith(href));

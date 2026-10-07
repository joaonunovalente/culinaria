import { siteConfig } from "@/config/site";

/** Absolute URL on the configured site. Absolute inputs are returned untouched. */
export const absoluteUrl = (value: string) => new URL(value, siteConfig.siteUrl).toString();

/** Canonical URL for a site-relative pathname. */
export const canonicalUrl = (pathname: string) => new URL(pathname, siteConfig.siteUrl).toString();

import type { Metadata } from "next";

import { APP_NAME } from "@/lib/constants";
import { t } from "@/lib/strings";

import { env } from "@/server/env";

const SITE_DESCRIPTION = t("Application web Katalyx.");

function getSiteOrigin(): URL {
  return new URL(env.NEXT_PUBLIC_APP_URL);
}

/**
 * Root layout defaults: title template, Open Graph, Twitter card, crawl hints.
 * Per-route files export {@link pageMetadata} (or a partial `Metadata`) — Next merges with the tree.
 */
export function getRootMetadata(): Metadata {
  const base = getSiteOrigin();

  return {
    metadataBase: base,
    title: {
      default: APP_NAME,
      template: `%s · ${APP_NAME}`,
    },
    description: SITE_DESCRIPTION,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: APP_NAME,
      title: APP_NAME,
      description: SITE_DESCRIPTION,
      url: base,
    },
    twitter: {
      card: "summary_large_image",
      title: APP_NAME,
      description: SITE_DESCRIPTION,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export type PageMetadataInput = {
  /** Shown in tab and search results for this route. */
  title: string;
  description: string;
  /**
   * Path segment for canonical and `og:url`, e.g. `/tarifs` or `/blog/article`.
   * Omit for the homepage (already covered by root metadata).
   */
  path?: `/${string}`;
};

/**
 * Use in `page.tsx` or segment `layout.tsx` to set route-level SEO without repeating Open Graph fields.
 */
export function pageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const base = getSiteOrigin();
  const pathname = path && path.length > 0 ? path : "/";
  const url = new URL(pathname, `${base.origin}/`);

  return {
    title,
    description,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      title,
      description,
      url,
    },
    twitter: {
      title,
      description,
    },
  };
}

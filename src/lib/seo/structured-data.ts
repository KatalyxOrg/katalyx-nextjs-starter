import { APP_NAME } from "@/lib/constants";
import { t } from "@/lib/strings";

type SiteGraphInput = {
  name?: string;
  url: URL;
};

function organizationId(base: URL): string {
  return `${base.origin}/#organization`;
}

function websiteId(base: URL): string {
  return `${base.origin}/#website`;
}

function organizationNode(base: URL, name: string) {
  return {
    "@type": "Organization" as const,
    "@id": organizationId(base),
    name,
    url: base.origin,
  };
}

function websiteNode(base: URL, name: string) {
  return {
    "@type": "WebSite" as const,
    "@id": websiteId(base),
    name,
    url: base.origin,
    description: t("Application web Katalyx."),
    publisher: { "@id": organizationId(base) },
  };
}

/** Single-entity Organization script (e.g. a dedicated about page). */
export function createOrganizationJsonLd(input: SiteGraphInput) {
  const name = input.name ?? APP_NAME;
  const base = input.url;
  return {
    "@context": "https://schema.org",
    ...organizationNode(base, name),
  };
}

/** Single-entity WebSite script. */
export function createWebSiteJsonLd(input: SiteGraphInput) {
  const name = input.name ?? APP_NAME;
  const base = input.url;
  return {
    "@context": "https://schema.org",
    ...websiteNode(base, name),
  };
}

/**
 * Homepage-style graph: Organization + WebSite in one script.
 * Add more nodes here when you introduce Product, Article, FAQPage, etc.
 */
export function createSiteGraphJsonLd(input: SiteGraphInput) {
  const name = input.name ?? APP_NAME;
  const base = input.url;

  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(base, name), websiteNode(base, name)],
  };
}

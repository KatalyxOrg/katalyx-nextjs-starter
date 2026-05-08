type JsonLdProps = {
  /** Serialize server-side only; do not pass unsanitized user input. */
  data: unknown;
};

/** Renders `application/ld+json` for search engines. Safe when `data` is built from static or validated server data. */
export function JsonLd({ data }: JsonLdProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

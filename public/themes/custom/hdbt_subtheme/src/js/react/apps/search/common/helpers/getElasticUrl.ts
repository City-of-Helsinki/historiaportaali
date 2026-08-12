// Defined by the theme-builder from the ELASTIC_DEV_URL environment variable,
// but only in development builds. Production builds leave it undeclared, so it
// must always be read behind a typeof guard.
declare const ELASTIC_DEV_URL: string | undefined;

/**
 * Resolves the Elasticsearch URL a search app should query.
 *
 * Normally the URL comes from the data-elasticsearch-url attribute Drupal
 * renders on the app's root element. A development build can override it with
 * a remote Elasticsearch proxy so the app has real data to work with:
 *
 *   npm run dev-with-remote-data
 *
 * @param rootElement The element the app is mounted on.
 * @return The Elasticsearch URL, or an empty string if none is available.
 */
export const getElasticUrl = (rootElement: HTMLElement): string => {
  const devUrl = typeof ELASTIC_DEV_URL !== "undefined" ? ELASTIC_DEV_URL : "";

  return devUrl || (rootElement.dataset.elasticsearchUrl?.trim() ?? "");
};

export default getElasticUrl;

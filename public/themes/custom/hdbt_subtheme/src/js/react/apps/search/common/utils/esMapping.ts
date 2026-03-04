/**
 * Normalizes mapping mode for Elasticsearch facet fields.
 * When "keyword", use .keyword subfields for aggregations; when "text", use plain fields.
 */
export const getMappingMode = (
  mode?: "text" | "keyword",
): "text" | "keyword" => (mode === "keyword" ? "keyword" : "text");

/**
 * Resolves field name for ES aggregations: adds .keyword when needed.
 */
export const resolveEsFieldForAggregation = (
  field: string,
  useKeywordSubfields: boolean,
): string => (useKeywordSubfields ? `${field}.keyword` : field);

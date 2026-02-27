export const INDEX_NAME = "kore_school";
export const ITEMS_PER_PAGE = 20;
export const FACET_AGG_SIZE = 100;

export const FACET_CONFIG = [
  { key: "kore_type", field: "kore_type" },
  { key: "kore_language", field: "kore_language" },
] as const;

export const KEYWORD_SEARCH_FIELDS = ["kore_names^3", "title^2"] as const;

export const YEAR_RANGE_FIELDS = {
  kore_start_year: "kore_start_year",
  kore_end_year: "kore_end_year",
} as const;

export const SORT_FIELD_MAP = {
  title: "title",
} as const;

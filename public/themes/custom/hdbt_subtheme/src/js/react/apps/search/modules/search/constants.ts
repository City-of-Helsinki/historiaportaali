export const INDEX_NAME = 'content_and_media';
export const ITEMS_PER_PAGE = 20;
export const FACET_AGG_SIZE = 100;

// Facet metadata: URL key, ES field, and filtered aggregation key
export const FACET_CONFIG = [ 
  { key: 'formats', field: 'aggregated_formats_title', filteredKey: 'filtered_formats' },
  { key: 'phenomena', field: 'aggregated_phenomena_title', filteredKey: 'filtered_phenomena' },
  { key: 'neighbourhoods', field: 'aggregated_neighbourhoods_title', filteredKey: 'filtered_neighbourhoods' },
] as const;

 // Fields used for keyword search, with boosts
export const KEYWORD_SEARCH_FIELDS = ['aggregated_title^3', 'aggregated_keywords'] as const;

 // Fields used for year range filtering
export const YEAR_RANGE_FIELDS = ['aggregated_start_year', 'aggregated_end_year'] as const;
export const SORT_FIELD_MAP = { // UI sort keys to ES field names
  created: 'aggregated_created',
  year: 'aggregated_start_year',
} as const;
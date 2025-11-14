export type ContentItem = {
  nid?: string;
  mid?: string;
  title: string;
  image_url?: string;
  formats?: string[];
  phenomena?: string[];
  neighbourhoods?: string[];
  start_year?: number;
  end_year?: number;
  url: string;
};

export type SearchResponse = {
  result_count: number;
  documents: ContentItem[];
  facets: Facet[];
};

export type Facet = {
  name: string;
  values: FacetValue[];
};

export type FacetValue = {
  count: number;
  filter: string;
};

export type SearchFilters = {
  keywords: string;
  startYear?: number;
  endYear?: number;
  formats?: string[];
  phenomena?: string[];
  neighbourhoods?: string[];
};

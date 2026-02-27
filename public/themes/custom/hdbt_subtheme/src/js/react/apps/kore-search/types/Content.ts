import type { Facet, FacetValue } from "../../search/common/types/Content";

export type { Facet, FacetValue };

export type KoreItem = {
  nid?: string;
  title: string;
  kore_names?: string[];
  kore_type?: string[];
  kore_language?: string[];
  start_year?: number;
  end_year?: number;
  url: string;
};

export type SearchFilters = {
  keywords: string;
  startYear?: number;
  endYear?: number;
  kore_type?: string;
  kore_language?: string;
  sort?: string;
  sort_order?: string;
};

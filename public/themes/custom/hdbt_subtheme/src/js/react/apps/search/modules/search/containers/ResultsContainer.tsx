import type { estypes } from "@elastic/elasticsearch";
import { useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useEffect, useMemo } from "react";
import useSWR from "swr";
import { ResultsWrapper } from "../../../common/components/ResultsWrapper";
import { ResultCard } from "../components/ResultCard";
import { SortOptions } from "../components/SortOptions";
import {
  getPageAtom,
  initializedAtom,
  searchFiltersAtom,
  setPageAtom,
  facetsAtom,
  isLoadingFacetsAtom,
} from "../store";
import type {
  ContentItem,
  Facet,
  SearchFilters,
} from "../../../common/types/Content";
import {
  FACET_AGG_SIZE,
  FACET_CONFIG,
  INDEX_NAME,
  ITEMS_PER_PAGE,
  KEYWORD_SEARCH_FIELDS,
  SORT_FIELD_MAP,
  YEAR_RANGE_FIELDS,
} from "../constants";

interface ResultsContainerProps {
  url: string;
  itemsPerPage?: number;
  indexName?: string;
}

type ElasticQuery = {
  from: number;
  size: number;
  query: {
    bool: {
      must: unknown[];
      filter: unknown[];
    };
  };
  aggs: Record<string, unknown>;
  sort?: unknown[];
};

type AggregationBucket = {
  key: string;
  doc_count: number;
};

type TermsAggregation = {
  buckets: AggregationBucket[];
};

type Aggregations = {
  all_facets?: {
    language_filter?: Record<string, TermsAggregation>;
  };
} & Record<string, TermsAggregation | undefined>;

type SearchSource = {
  nid?: string[];
  mid?: string[];
  aggregated_title?: string[];
  title?: string[];
  listing_image_url?: string[];
  aggregated_formats_title?: string[];
  aggregated_phenomena_title?: string[];
  aggregated_neighbourhoods_title?: string[];
  aggregated_start_year?: string[];
  aggregated_end_year?: string[];
  url?: string[];
};

const getMappingMode = (): "text" | "keyword" => {
  const mode = drupalSettings.search?.mappingMode;
  return mode === "keyword" ? "keyword" : "text";
};

const buildQueryString = ({
  filters,
  offset,
  itemsPerPage,
  useKeywordSubfields,
  languageField,
  languageValue,
}: {
  filters: SearchFilters;
  offset: number;
  itemsPerPage: number;
  useKeywordSubfields: boolean;
  languageField: string;
  languageValue: string;
}) => {
  const trimmedKeywords = filters.keywords.trim();
  const resolveField = (field: (typeof FACET_CONFIG)[number]["field"]) =>
    useKeywordSubfields ? `${field}.keyword` : field;
  const resolvedFacetFields = Object.fromEntries(
    FACET_CONFIG.map((facet) => [facet.key, resolveField(facet.field)]),
  ) as Record<(typeof FACET_CONFIG)[number]["key"], string>;
  const query: ElasticQuery = {
    from: offset,
    size: itemsPerPage,
    query: {
      bool: {
        must: [],
        filter: [
          {
            term: {
              [languageField]: languageValue,
            },
          },
        ],
      },
    },
    aggs: {
      all_facets: {
        global: {},
        aggs: {
          language_filter: {
            filter: {
              term: {
                [languageField]: languageValue,
              },
            },
            aggs: Object.fromEntries(
              FACET_CONFIG.map((facet) => [
                facet.key,
                {
                  terms: {
                    field: resolvedFacetFields[facet.key],
                    size: FACET_AGG_SIZE,
                  },
                },
              ]),
            ),
          },
        },
      },
      ...Object.fromEntries(
        FACET_CONFIG.map((facet) => [
          facet.filteredKey,
          {
            terms: {
              field: resolvedFacetFields[facet.key],
              size: FACET_AGG_SIZE,
            },
          },
        ]),
      ),
    },
    sort: [],
  };

  // Add text search if keywords provided
  if (trimmedKeywords) {
    query.query.bool.must.push({
      multi_match: {
        query: trimmedKeywords,
        fields: KEYWORD_SEARCH_FIELDS,
        type: "best_fields",
        operator: "and",
        fuzziness: "AUTO",
      },
    });
  } else {
    query.query.bool.must.push({ match_all: {} });
  }

  // Add year range filters
  if (filters.startYear !== undefined || filters.endYear !== undefined) {
    const yearRange: { gte?: number; lte?: number } = {};
    if (filters.endYear !== undefined) yearRange.lte = filters.endYear;
    if (filters.startYear !== undefined) yearRange.gte = filters.startYear;

    query.query.bool.filter.push({
      bool: {
        should: YEAR_RANGE_FIELDS.map((field) => ({
          range: { [field]: yearRange },
        })),
        minimum_should_match: 1,
      },
    });
  }

  // Add filter arrays
  for (const facet of FACET_CONFIG) {
    const activeFilters = filters[facet.key as keyof typeof filters];
    if (Array.isArray(activeFilters) && activeFilters.length > 0) {
      query.query.bool.filter.push({
        terms: { [resolvedFacetFields[facet.key]]: activeFilters },
      });
    }
  }

  // Add sorting
  const sortValue = filters.sort || "relevance";
  const sortOrder = (filters.sort_order || "DESC").toLowerCase();

  if (sortValue in SORT_FIELD_MAP) {
    query.sort = [
      {
        [SORT_FIELD_MAP[sortValue as keyof typeof SORT_FIELD_MAP]]: {
          order: sortOrder,
        },
      },
    ];
  } else if (sortValue === "relevance") {
    // relevance - use _score when there are keywords, otherwise don't add sort (use default ES ordering)
    if (trimmedKeywords) {
      query.sort = [{ _score: { order: "desc" } }];
    } else {
      query.sort = undefined;
    }
  }

  return JSON.stringify(query);
};

// Map Elasticsearch aggregations to facets
const mapAggregationsToFacets = (
  aggregations: Aggregations | undefined,
): Facet[] => {
  if (!aggregations) return [];

  // Get all available options from global aggregations
  const allFacets = aggregations?.all_facets?.language_filter || {};

  return FACET_CONFIG.filter((facet) => allFacets[facet.key]).map((facet) => {
    const { key, field, filteredKey } = facet;
    // Create a map of filtered counts for quick lookup
    const filteredBuckets = (aggregations?.[filteredKey]?.buckets ||
      []) as AggregationBucket[];
    const filteredCounts = new Map(
      filteredBuckets.map((bucket) => [bucket.key, bucket.doc_count]),
    );

    // Use all available options from global, but with counts from filtered
    return {
      name: field,
      values: allFacets[key].buckets.map((bucket) => ({
        filter: bucket.key,
        count: filteredCounts.get(bucket.key) || 0, // Use filtered count, or 0 if not in results
      })),
    };
  });
};

export const ResultsContainer = ({
  url,
  itemsPerPage = ITEMS_PER_PAGE,
  indexName = INDEX_NAME,
}: ResultsContainerProps) => {
  const filters = useAtomValue(searchFiltersAtom);
  const currentPageIndex = useAtomValue(getPageAtom); // 0-based index
  const setPageIndex = useSetAtom(setPageAtom);
  const readInitialized = useAtomCallback(
    useCallback((get) => get(initializedAtom), []),
  );
  const setInitialized = useSetAtom(initializedAtom);
  const setFacets = useSetAtom(facetsAtom);
  const setIsLoadingFacets = useSetAtom(isLoadingFacetsAtom);

  // Calculate offset from 0-based page index
  const offset = currentPageIndex * itemsPerPage;

  const mappingMode = getMappingMode();
  const useKeywordSubfields = mappingMode === "keyword";

  const languageField = "search_api_language";
  const languageValue = drupalSettings.path.currentLanguage || "fi";

  // Build Elasticsearch query - useMemo to prevent infinite loops
  const queryString = useMemo(() => {
    return buildQueryString({
      filters,
      offset,
      itemsPerPage,
      useKeywordSubfields,
      languageField,
      languageValue,
    });
  }, [filters, languageValue, offset, itemsPerPage, useKeywordSubfields]);

  const fetcher = useCallback(
    (key: string) =>
      fetch(`${url}/${indexName}/_search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: key,
      }).then((res) => res.json()),
    [indexName, url],
  );

  const { data, error, isLoading, isValidating } = useSWR(
    queryString,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  // Update facets when data changes
  useEffect(() => {
    setIsLoadingFacets(isLoading);
    if (data?.aggregations) {
      const mappedFacets = mapAggregationsToFacets(data.aggregations);
      setFacets(mappedFacets);
    }
  }, [data, isLoading, setFacets, setIsLoadingFacets]);

  useEffect(() => {
    if (!readInitialized() && !isLoading && !isValidating) {
      setInitialized(true);
    }
  }, [isLoading, isValidating, readInitialized, setInitialized]);

  // Map Elasticsearch result to ContentItem
  const mapElasticsearchResult = (
    hit: estypes.SearchHit<SearchSource>,
  ): ContentItem => {
    const source: SearchSource = hit._source ?? {};
    return {
      nid: source.nid?.[0],
      mid: source.mid?.[0],
      title: source.aggregated_title?.[0] || source.title?.[0] || "Untitled",
      image_url: source.listing_image_url?.[0],
      formats: source.aggregated_formats_title || [],
      phenomena: source.aggregated_phenomena_title || [],
      neighbourhoods: source.aggregated_neighbourhoods_title || [],
      start_year: source.aggregated_start_year?.[0]
        ? Number.parseInt(source.aggregated_start_year[0])
        : undefined,
      end_year: source.aggregated_end_year?.[0]
        ? Number.parseInt(source.aggregated_end_year[0])
        : undefined,
      url: source.url?.[0] || "#",
    };
  };

  const resultItemCallBack = (item: estypes.SearchHit<unknown>) => {
    const contentItem = mapElasticsearchResult(
      item as estypes.SearchHit<SearchSource>,
    );
    return (
      <ResultCard
        key={contentItem.nid || contentItem.mid || item._id}
        {...contentItem}
      />
    );
  };

  return (
    <ResultsWrapper
      {...{
        currentPageIndex,
        data,
        error,
        resultItemCallBack,
        setPageIndex,
        itemsPerPage,
      }}
      isLoading={isLoading}
      shouldScroll={readInitialized()}
      sortElement={<SortOptions />}
    />
  );
};

export default ResultsContainer;

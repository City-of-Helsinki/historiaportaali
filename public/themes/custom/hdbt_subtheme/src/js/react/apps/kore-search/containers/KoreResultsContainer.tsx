import type { estypes } from "@elastic/elasticsearch";
import { useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useEffect, useMemo } from "react";
import useSWR from "swr";
import { ResultsWrapper } from "../../search/common/components/ResultsWrapper";
import { KoreResultCard } from "../components/KoreResultCard";
import {
  getPageAtom,
  initializedAtom,
  searchFiltersAtom,
  setPageAtom,
  facetsAtom,
  isLoadingFacetsAtom,
} from "../store";
import type { KoreItem, SearchFilters, Facet } from "../types/Content";
import {
  FACET_AGG_SIZE,
  FACET_CONFIG,
  INDEX_NAME,
  ITEMS_PER_PAGE,
  KEYWORD_SEARCH_FIELDS,
  YEAR_RANGE_FIELDS,
} from "../constants";

interface KoreResultsContainerProps {
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
  all_facets?: Record<string, TermsAggregation>;
};

type SearchSource = {
  nid?: string[];
  title?: string[];
  kore_names?: string[];
  kore_type?: string[];
  kore_language?: string[];
  kore_start_year?: number[];
  kore_end_year?: number[];
  url?: string[];
};

const keywordMatch = (query: string) => ({
  multi_match: {
    query,
    fields: [...KEYWORD_SEARCH_FIELDS],
    type: "best_fields",
    operator: "and",
    fuzziness: "AUTO",
  },
});

const yearFilters = (filters: SearchFilters): unknown[] => {
  const arr: unknown[] = [];
  if (filters.startYear !== undefined) {
    arr.push({
      range: {
        [YEAR_RANGE_FIELDS.kore_end_year]: { gte: filters.startYear },
      },
    });
  }
  if (filters.endYear !== undefined) {
    arr.push({
      range: {
        [YEAR_RANGE_FIELDS.kore_start_year]: { lte: filters.endYear },
      },
    });
  }
  return arr;
};

const buildQueryString = ({
  filters,
  offset,
  itemsPerPage,
  languageField,
  languageValue,
}: {
  filters: SearchFilters;
  offset: number;
  itemsPerPage: number;
  languageField: string;
  languageValue: string;
}) => {
  const keywords = filters.keywords.trim();
  const langFilter = { term: { [languageField]: languageValue } };
  const yearFilterList = yearFilters(filters);

  // Facet aggs: keyword + year only (type/language excluded so counts are independent)
  const facetBaseFilter: unknown[] = [
    langFilter,
    ...(keywords ? [keywordMatch(keywords)] : []),
    ...yearFilterList,
  ];

  const facetTermFilters: unknown[] = [];
  for (const facet of FACET_CONFIG) {
    const value = filters[facet.key as keyof typeof filters];
    if (value) {
      facetTermFilters.push({ term: { [facet.field]: value } });
    }
  }

  const query: ElasticQuery = {
    from: offset,
    size: itemsPerPage,
    query: {
      bool: {
        must: [keywords ? keywordMatch(keywords) : { match_all: {} }],
        filter: [langFilter, ...yearFilterList, ...facetTermFilters],
      },
    },
    aggs: {
      all_facets: {
        filter: { bool: { must: facetBaseFilter } },
        aggs: Object.fromEntries(
          FACET_CONFIG.map((f) => [
            f.key,
            { terms: { field: f.field, size: FACET_AGG_SIZE } },
          ]),
        ),
      },
    },
    sort:
      filters.sort === "title"
        ? [{ title: { order: (filters.sort_order || "ASC").toLowerCase() } }]
        : keywords
          ? [{ _score: { order: "desc" } }]
          : [],
  };

  return JSON.stringify(query);
};

const toKoreItem = (hit: estypes.SearchHit<SearchSource>): KoreItem => {
  const s = hit._source ?? {};
  const starts = s.kore_start_year?.filter(Boolean) ?? [];
  const ends = s.kore_end_year?.filter(Boolean) ?? [];
  return {
    nid: s.nid?.[0],
    title: s.title?.[0] || "Untitled",
    kore_names: s.kore_names,
    kore_type: s.kore_type,
    kore_language: s.kore_language,
    start_year: starts.length ? Math.min(...starts) : undefined,
    end_year: ends.length ? Math.max(...ends) : undefined,
    url: s.url?.[0] || "#",
  };
};

const mapAggregationsToFacets = (
  aggregations: Aggregations | undefined,
): Facet[] => {
  const allFacets = aggregations?.all_facets;
  if (!allFacets) return [];

  return FACET_CONFIG.filter((f) => allFacets[f.key]).map((f) => ({
    name: f.field,
    values: allFacets[f.key].buckets.map((b) => ({
      filter: b.key,
      count: b.doc_count,
    })),
  }));
};

export const KoreResultsContainer = ({
  url,
  itemsPerPage = ITEMS_PER_PAGE,
  indexName = INDEX_NAME,
}: KoreResultsContainerProps) => {
  const filters = useAtomValue(searchFiltersAtom);
  const currentPageIndex = useAtomValue(getPageAtom);
  const setPageIndex = useSetAtom(setPageAtom);
  const readInitialized = useAtomCallback(
    useCallback((get) => get(initializedAtom), []),
  );
  const setInitialized = useSetAtom(initializedAtom);
  const setFacets = useSetAtom(facetsAtom);
  const setIsLoadingFacets = useSetAtom(isLoadingFacetsAtom);

  const offset = currentPageIndex * itemsPerPage;
  const languageField = "search_api_language";
  const languageValue = drupalSettings?.path?.currentLanguage || "fi";

  const queryString = useMemo(
    () =>
      buildQueryString({
        filters,
        offset,
        itemsPerPage,
        languageField,
        languageValue,
      }),
    [filters, languageValue, offset, itemsPerPage],
  );

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
    { revalidateOnFocus: false },
  );

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

  const resultItemCallBack = (item: estypes.SearchHit<unknown>) => {
    const koreItem = toKoreItem(item as estypes.SearchHit<SearchSource>);
    return <KoreResultCard key={koreItem.nid || item._id} {...koreItem} />;
  };

  return (
    <ResultsWrapper
      currentPageIndex={currentPageIndex}
      data={data}
      error={error}
      resultItemCallBack={resultItemCallBack}
      setPageIndex={setPageIndex}
      itemsPerPage={itemsPerPage}
      isLoading={isLoading}
      shouldScroll={readInitialized()}
    />
  );
};

export default KoreResultsContainer;

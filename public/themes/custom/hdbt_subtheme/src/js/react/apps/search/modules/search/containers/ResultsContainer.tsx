import type { estypes } from '@elastic/elasticsearch';
import { useAtomValue, useSetAtom } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { useCallback, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { ResultsWrapper } from '../../../common/components/ResultsWrapper';
import { ResultCard } from '../components/ResultCard';
import { SortOptions } from '../components/SortOptions';
import { getPageAtom, initializedAtom, searchFiltersAtom, setPageAtom, facetsAtom, isLoadingFacetsAtom } from '../store';
import type { ContentItem, Facet } from '../../../common/types/Content';

interface ResultsContainerProps {
  url: string;
  itemsPerPage?: number;
  indexName?: string;
}

const facetConfig = [
  { key: 'formats', field: 'aggregated_formats_title', filteredKey: 'filtered_formats' },
  { key: 'phenomena', field: 'aggregated_phenomena_title', filteredKey: 'filtered_phenomena' },
  { key: 'neighbourhoods', field: 'aggregated_neighbourhoods_title', filteredKey: 'filtered_neighbourhoods' },
] as const;
const facetFields = facetConfig.map((facet) => facet.field);
const keywordSearchFields = ['aggregated_title^3', 'aggregated_keywords'] as const;
const yearRangeFields = ['aggregated_start_year', 'aggregated_end_year'] as const;
const sortFieldMap = {
  created: 'aggregated_created',
  year: 'aggregated_start_year',
} as const;
const getMappingMode = (): 'text' | 'keyword' => {
  const mode = drupalSettings.search?.mappingMode;
  return mode === 'keyword' ? 'keyword' : 'text';
};

const buildQueryString = ({
  filters,
  offset,
  itemsPerPage,
  useKeywordSubfields,
  languageField,
  languageValue,
}: {
  filters: any;
  offset: number;
  itemsPerPage: number;
  useKeywordSubfields: boolean;
  languageField: string;
  languageValue: string;
}) => {
  const trimmedKeywords = filters.keywords.trim();
  const resolveField = (field: (typeof facetFields)[number]) =>
    useKeywordSubfields ? `${field}.keyword` : field;
  const resolvedFacetFields = Object.fromEntries(
    facetConfig.map((facet) => [facet.key, resolveField(facet.field)]),
  ) as Record<(typeof facetConfig)[number]['key'], string>;
  const query: any = {
    from: offset,
    size: itemsPerPage,
    query: {
      bool: {
        must: [],
        filter: [
          {
            term: {
              [languageField]: languageValue
            }
          }
        ]
      }
    },
    aggs: {
      all_facets: {
        global: {},
        aggs: {
          language_filter: {
            filter: {
              term: {
                [languageField]: languageValue
              }
            },
            aggs: Object.fromEntries(
              facetConfig.map((facet) => [
                facet.key,
                { terms: { field: resolvedFacetFields[facet.key], size: 100 } },
              ]),
            )
          }
        }
      },
      ...Object.fromEntries(
        facetConfig.map((facet) => [
          facet.filteredKey,
          { terms: { field: resolvedFacetFields[facet.key], size: 100 } },
        ]),
      )
    },
    sort: []
  };

  // Add text search if keywords provided
  if (trimmedKeywords) {
    query.query.bool.must.push({
      multi_match: {
        query: trimmedKeywords,
        fields: keywordSearchFields,
        type: "best_fields",
        operator: "and",
        fuzziness: "AUTO"
      }
    });
  } else {
    query.query.bool.must.push({ match_all: {} });
  }

  // Add year range filters
  if (filters.startYear !== undefined || filters.endYear !== undefined) {
    const yearRange: any = {};
    if (filters.endYear !== undefined) yearRange.lte = filters.endYear;
    if (filters.startYear !== undefined) yearRange.gte = filters.startYear;

    query.query.bool.filter.push({
      bool: {
        should: yearRangeFields.map((field) => ({ range: { [field]: yearRange } })),
        minimum_should_match: 1
      }
    });
  }

  // Add filter arrays
  facetConfig.forEach((facet) => {
    const activeFilters = filters[facet.key as keyof typeof filters];
    if (Array.isArray(activeFilters) && activeFilters.length > 0) {
      query.query.bool.filter.push({
        terms: { [resolvedFacetFields[facet.key]]: activeFilters }
      });
    }
  });

  // Add sorting
  const sortValue = filters.sort || 'relevance';
  const sortOrder = (filters.sort_order || 'DESC').toLowerCase();

  if (sortValue in sortFieldMap) {
    query.sort = [{ [sortFieldMap[sortValue as keyof typeof sortFieldMap]]: { order: sortOrder } }];
  } else if (sortValue === 'relevance') {
    // relevance - use _score when there are keywords, otherwise don't add sort (use default ES ordering)
    if (trimmedKeywords) {
      query.sort = [{ "_score": { "order": "desc" } }];
    } else {
      delete query.sort;
    }
  }

  return JSON.stringify(query);
};

// Map Elasticsearch aggregations to facets
const mapAggregationsToFacets = (aggregations: any): Facet[] => {
  if (!aggregations) return [];

  // Get all available options from global aggregations
  const allFacets = aggregations?.all_facets?.language_filter || {};

  return facetConfig
    .filter(({ key }) => allFacets[key])
    .map(({ key, field, filteredKey }) => {
      // Create a map of filtered counts for quick lookup
      const filteredCounts = new Map(
        (aggregations?.[filteredKey]?.buckets || []).map((bucket: any) => [bucket.key, bucket.doc_count]),
      );

      // Use all available options from global, but with counts from filtered
      return {
        name: field,
        values: allFacets[key].buckets.map((bucket: any) => ({
          filter: bucket.key,
          count: filteredCounts.get(bucket.key) || 0 // Use filtered count, or 0 if not in results
        }))
      };
    });
};

export const ResultsContainer = ({ url, itemsPerPage = 20, indexName = 'content_and_media' }: ResultsContainerProps) => {
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
  const useKeywordSubfields = mappingMode === 'keyword';

  const languageField = 'search_api_language';
  const languageValue = drupalSettings.path.currentLanguage || 'fi';

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
  }, [filters, languageField, languageValue, offset, itemsPerPage, useKeywordSubfields]);

  const fetcher = useCallback(
    (key: string) =>
      fetch(`${url}/${indexName}/_search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: key,
      }).then((res) => res.json()),
    [indexName, url],
  );

  const { data, error, isLoading, isValidating } = useSWR(queryString, fetcher, {
    revalidateOnFocus: false,
  });

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
  const mapElasticsearchResult = (hit: estypes.SearchHit<any>): ContentItem => {
    const source = hit._source;
    return {
      nid: source.nid?.[0],
      mid: source.mid?.[0],
      title: source.aggregated_title?.[0] || source.title?.[0] || 'Untitled',
      image_url: source.listing_image_url?.[0],
      formats: source.aggregated_formats_title || [],
      phenomena: source.aggregated_phenomena_title || [],
      neighbourhoods: source.aggregated_neighbourhoods_title || [],
      start_year: source.aggregated_start_year?.[0] ? parseInt(source.aggregated_start_year[0]) : undefined,
      end_year: source.aggregated_end_year?.[0] ? parseInt(source.aggregated_end_year[0]) : undefined,
      url: source.url?.[0] || '#'
    };
  };

  const resultItemCallBack = (item: estypes.SearchHit<any>) => {
    const contentItem = mapElasticsearchResult(item);
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


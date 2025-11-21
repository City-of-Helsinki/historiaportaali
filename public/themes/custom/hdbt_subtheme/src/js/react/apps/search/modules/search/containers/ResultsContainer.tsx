import type { estypes } from '@elastic/elasticsearch';
import { useAtomValue, useSetAtom } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { useCallback, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { ResultsWrapper } from '../../../common/components/ResultsWrapper';
import { ResultCard } from '../components/ResultCard';
import { SortDropdown } from '../components/SortDropdown';
import { getPageAtom, initializedAtom, searchFiltersAtom, setPageAtom, facetsAtom, isLoadingFacetsAtom } from '../store';
import type { ContentItem, Facet } from '../../../common/types/Content';

interface ResultsContainerProps {
  url: string;
  itemsPerPage?: number;
}

// Map Elasticsearch aggregations to facets
const mapAggregationsToFacets = (aggregations: any): Facet[] => {
  if (!aggregations) return [];
  
  // Get all available options from global aggregations
  const allFacets = aggregations?.all_facets?.language_filter || {};
  
  const facetMapping = [
    { key: 'formats', name: 'aggregated_formats_title', filteredKey: 'filtered_formats' },
    { key: 'phenomena', name: 'aggregated_phenomena_title', filteredKey: 'filtered_phenomena' },
    { key: 'neighbourhoods', name: 'aggregated_neighbourhoods_title', filteredKey: 'filtered_neighbourhoods' }
  ];

  return facetMapping
    .filter(({ key }) => allFacets[key])
    .map(({ key, name, filteredKey }) => {
      // Create a map of filtered counts for quick lookup
      const filteredCounts = new Map(
        (aggregations?.[filteredKey]?.buckets || []).map((bucket: any) => [bucket.key, bucket.doc_count])
      );

      // Use all available options from global, but with counts from filtered
      return {
        name,
        values: allFacets[key].buckets.map((bucket: any) => ({
          filter: bucket.key,
          count: filteredCounts.get(bucket.key) || 0 // Use filtered count, or 0 if not in results
        }))
      };
    });
};

export const ResultsContainer = ({ url, itemsPerPage = 20 }: ResultsContainerProps) => {
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

  // Build Elasticsearch query - useMemo to prevent infinite loops
  const queryString = useMemo(() => {
    const query: any = {
      from: offset,
      size: itemsPerPage,
      query: {
        bool: {
          must: [],
          filter: [
            {
              term: {
                search_api_language: drupalSettings.path.currentLanguage || 'fi'
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
                  search_api_language: drupalSettings.path.currentLanguage || 'fi'
                }
              },
              aggs: {
                formats: {
                  terms: { field: "aggregated_formats_title", size: 100 }
                },
                phenomena: {
                  terms: { field: "aggregated_phenomena_title", size: 100 }
                },
                neighbourhoods: {
                  terms: { field: "aggregated_neighbourhoods_title", size: 100 }
                }
              }
            }
          }
        },
        filtered_formats: {
          terms: { field: "aggregated_formats_title", size: 100 }
        },
        filtered_phenomena: {
          terms: { field: "aggregated_phenomena_title", size: 100 }
        },
        filtered_neighbourhoods: {
          terms: { field: "aggregated_neighbourhoods_title", size: 100 }
        }
      },
      sort: []
    };

    // Add text search if keywords provided
    if (filters.keywords.trim()) {
      query.query.bool.must.push({
        multi_match: {
          query: filters.keywords,
          fields: [
            "aggregated_title^3",
            "aggregated_keywords",
          ],
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
      if (filters.startYear !== undefined) yearRange.gte = filters.startYear;
      if (filters.endYear !== undefined) yearRange.lte = filters.endYear;

      query.query.bool.filter.push({
        bool: {
          should: [
            { range: { "aggregated_start_year": yearRange } },
            { range: { "aggregated_end_year": yearRange } }
          ],
          minimum_should_match: 1
        }
      });
    }

    // Add filter arrays
    if (filters.formats && filters.formats.length > 0) {
      query.query.bool.filter.push({
        terms: { "aggregated_formats_title": filters.formats }
      });
    }

    if (filters.phenomena && filters.phenomena.length > 0) {
      query.query.bool.filter.push({
        terms: { "aggregated_phenomena_title": filters.phenomena }
      });
    }

    if (filters.neighbourhoods && filters.neighbourhoods.length > 0) {
      query.query.bool.filter.push({
        terms: { "aggregated_neighbourhoods_title": filters.neighbourhoods }
      });
    }

    // Add sorting
    const sortValue = filters.sort || 'relevance';
    if (sortValue === 'newest') {
      query.sort = [{ "aggregated_created": { "order": "desc" } }];
    } else if (sortValue === 'oldest') {
      query.sort = [{ "aggregated_created": { "order": "asc" } }];
    } else {
      // relevance - use _score when there are keywords, otherwise don't add sort (use default ES ordering)
      if (filters.keywords.trim()) {
        query.sort = [{ "_score": { "order": "desc" } }];
      } else {
        delete query.sort;
      }
    }

    return JSON.stringify(query);
  }, [filters, offset, itemsPerPage]);

  const fetcher = useCallback(
    (key: string) =>
      fetch(`${url}/content_and_media/_search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: key,
      }).then((res) => res.json()),
    [url],
  );

  const { data, error, isLoading, isValidating } = useSWR(queryString, fetcher, {
    revalidateOnFocus: false,
  });

  const loading = isLoading;

  // Update facets when data changes
  useEffect(() => {
    setIsLoadingFacets(loading);
    if (data?.aggregations) {
      const mappedFacets = mapAggregationsToFacets(data.aggregations);
      setFacets(mappedFacets);
    }
  }, [data, loading, setFacets, setIsLoadingFacets]);

  useEffect(() => {
    if (!readInitialized() && !loading && !isValidating) {
      setInitialized(true);
    }
  }, [loading, isValidating, readInitialized, setInitialized]);

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

  const getCustomTotal = () => {
    if (!data?.hits?.total) {
      return 0;
    }
    const total = typeof data.hits.total === 'number' 
      ? data.hits.total 
      : data.hits.total.value;
    return total > 9999 ? 10000 : total;
  };

  const customTotal = getCustomTotal();

  const getHeaderText = () => {
    if (!customTotal) {
      return '';
    }

    return customTotal > 9999
      ? Drupal.t('Over 10 000 results', {}, { context: 'Historia search' })
      : Drupal.formatPlural(
          customTotal,
          '1 result',
          '@count results',
          {},
          { context: 'Historia search' },
        );
  };

  return (
    <ResultsWrapper
      {...{
        currentPageIndex,
        customTotal,
        data,
        error,
        getHeaderText,
        resultItemCallBack,
        setPageIndex,
        itemsPerPage,
      }}
      isLoading={loading}
      shouldScroll={readInitialized()}
      sortElement={<SortDropdown />}
    />
  );
};

export default ResultsContainer;


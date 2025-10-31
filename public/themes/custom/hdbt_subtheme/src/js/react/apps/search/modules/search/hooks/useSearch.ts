import { useState, useEffect } from 'react';
import { SearchFilters, SearchResponse, ContentItem, Facet } from '../../../common/types/Content';

interface UseSearchParams {
  filters: SearchFilters;
  offset: number;
  limit: number;
  elasticsearchUrl: string;
}

interface UseSearchReturn {
  data: SearchResponse | null;
  loading: boolean;
  error: string | null;
}

// Map Elasticsearch field names to our content structure
const mapElasticsearchResult = (hit: any): ContentItem => {
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

const buildElasticsearchQuery = (filters: SearchFilters, offset: number, limit: number) => {
  const query: any = {
    from: offset,
    size: limit,
    query: {
      bool: {
        must: [],
        filter: [
          {
            term:
            {
              search_api_language: drupalSettings.path.currentLanguage || 'fi'
            }
          }
        ]
      }
    },
    aggs: {
      formats: {
        terms: {
          field: "aggregated_formats_title.keyword",
          size: 50
        }
      },
      phenomena: {
        terms: {
          field: "aggregated_phenomena_title.keyword", 
          size: 50
        }
      },
      neighbourhoods: {
        terms: {
          field: "aggregated_neighbourhoods_title.keyword",
          size: 50
        }
      }
    }
  };

  // Add text search if keywords provided
  if (filters.keywords.trim()) {
    query.query.bool.must.push({
      multi_match: {
        query: filters.keywords,
        fields: [
          "aggregated_title^3",
          "title^3", 
          "body",
          "aggregated_phenomena_title^2",
          "aggregated_formats_title^2",
          "aggregated_neighbourhoods_title^2"
        ],
        type: "best_fields",
        fuzziness: "AUTO"
      }
    });
  } else {
    // If no keywords, match all documents
    query.query.bool.must.push({
      match_all: {}
    });
  }

  // Add year range filters
  if (filters.startYear || filters.endYear) {
    const yearRange: any = {};
    if (filters.startYear) {
      yearRange.gte = filters.startYear;
    }
    if (filters.endYear) {
      yearRange.lte = filters.endYear;
    }
    
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

  // Add format filters
  if (filters.formats && filters.formats.length > 0) {
    query.query.bool.filter.push({
      terms: {
        "aggregated_formats_title.keyword": filters.formats
      }
    });
  }

  // Add phenomena filters
  if (filters.phenomena && filters.phenomena.length > 0) {
    query.query.bool.filter.push({
      terms: {
        "aggregated_phenomena_title.keyword": filters.phenomena
      }
    });
  }

  // Add neighbourhood filters
  if (filters.neighbourhoods && filters.neighbourhoods.length > 0) {
    query.query.bool.filter.push({
      terms: {
        "aggregated_neighbourhoods_title.keyword": filters.neighbourhoods
      }
    });
  }

  return query;
};

// Map Elasticsearch aggregations to facets
const mapAggregationsToFacets = (aggregations: any): Facet[] => {
  const facets: Facet[] = [];
  
  if (aggregations.formats) {
    facets.push({
      name: 'aggregated_formats_title',
      values: aggregations.formats.buckets.map((bucket: any) => ({
        filter: bucket.key,
        count: bucket.doc_count
      }))
    });
  }

  if (aggregations.phenomena) {
    facets.push({
      name: 'aggregated_phenomena_title',
      values: aggregations.phenomena.buckets.map((bucket: any) => ({
        filter: bucket.key,
        count: bucket.doc_count
      }))
    });
  }

  if (aggregations.neighbourhoods) {
    facets.push({
      name: 'aggregated_neighbourhoods_title',
      values: aggregations.neighbourhoods.buckets.map((bucket: any) => ({
        filter: bucket.key,
        count: bucket.doc_count
      }))
    });
  }

  return facets;
};

export const useSearch = ({ filters, offset, limit, elasticsearchUrl }: UseSearchParams): UseSearchReturn => {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSearch = async () => {
      if (!filters.keywords.trim() && !filters.formats?.length && !filters.phenomena?.length && !filters.neighbourhoods?.length && !filters.startYear && !filters.endYear) {
        setData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const esQuery = buildElasticsearchQuery(filters, offset, limit);
        const response = await fetch(`${elasticsearchUrl}/content_and_media/_search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(esQuery)
        });

        if (!response.ok) {
          throw new Error(`Elasticsearch error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error.reason || 'Elasticsearch query error');
        }

        const documents = result.hits.hits.map(mapElasticsearchResult);
        const facets = mapAggregationsToFacets(result.aggregations || {});

        setData({
          result_count: result.hits.total.value || result.hits.total,
          documents,
          facets
        });
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred during search');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [filters, offset, limit, elasticsearchUrl]);

  return { data, loading, error };
};
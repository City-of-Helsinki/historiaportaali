import React, { useState, useCallback } from 'react';
import { SearchForm } from './components/SearchForm';
import { SearchResults } from './components/SearchResults';
import { useSearch } from './hooks/useSearch';
import { SearchFilters } from '../../common/types/Content';

interface SearchContainerProps {
  elasticsearchUrl: string;
}

export const SearchContainer: React.FC<SearchContainerProps> = ({ elasticsearchUrl }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    keywords: '',
    startYear: undefined,
    endYear: undefined,
    formats: [],
    phenomena: [],
    neighbourhoods: []
  });

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  const { data, loading, error } = useSearch({
    filters,
    offset: currentPage * itemsPerPage,
    limit: itemsPerPage,
    elasticsearchUrl
  });

  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page when filters change
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="historia-search">
      <SearchForm 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        facets={data?.facets}
        loading={loading}
      />
      <SearchResults 
        results={data?.documents || []}
        totalCount={data?.result_count || 0}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        loading={loading}
        error={error}
        filters={filters}
      />
    </div>
  );
};

import React, { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { SearchForm } from './components/SearchForm';
import { SearchResults } from './components/SearchResults';
import { useSearch } from './hooks/useSearch';
import { searchFiltersAtom, pageAtom, setPageAtom } from './store';

interface SearchContainerProps {
  elasticsearchUrl: string;
}

export const SearchContainer: React.FC<SearchContainerProps> = ({ elasticsearchUrl }) => {
  const filters = useAtomValue(searchFiltersAtom);
  const currentPage = useAtomValue(pageAtom);
  const setPage = useSetAtom(setPageAtom);
  const itemsPerPage = 20;

  // Convert 1-based page to 0-based offset
  const offset = (currentPage - 1) * itemsPerPage;

  const { data, loading, error } = useSearch({
    filters,
    offset,
    limit: itemsPerPage,
    elasticsearchUrl
  });

  const handlePageChange = (page: number) => {
    setPage(page);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      window.location.reload();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="historia-search">
      <SearchForm 
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
      />
    </div>
  );
};

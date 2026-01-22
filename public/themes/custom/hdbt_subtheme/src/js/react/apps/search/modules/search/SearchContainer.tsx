import React, { useEffect } from 'react';
import { SearchForm } from './components/SearchForm';
import { ResultsContainer } from './containers/ResultsContainer';

interface SearchContainerProps {
  elasticsearchUrl: string;
}

const INDEX_NAME = 'content_and_media';
const ITEMS_PER_PAGE = 20;

export const SearchContainer: React.FC<SearchContainerProps> = ({ elasticsearchUrl }) => {
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
      <SearchForm />
      <ResultsContainer 
        url={elasticsearchUrl}
        indexName={INDEX_NAME}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </div>
  );
};

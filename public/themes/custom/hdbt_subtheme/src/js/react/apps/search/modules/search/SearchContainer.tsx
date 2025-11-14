import React, { useEffect } from 'react';
import { SearchForm } from './components/SearchForm';
import { ResultsContainer } from './containers/ResultsContainer';

interface SearchContainerProps {
  elasticsearchUrl: string;
}

export const SearchContainer: React.FC<SearchContainerProps> = ({ elasticsearchUrl }) => {
  const itemsPerPage = 20;

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
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

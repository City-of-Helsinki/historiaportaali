import type React from "react";
import { useEffect } from "react";
import { SearchForm } from "./components/SearchForm";
import { ResultsContainer } from "./containers/ResultsContainer";
import { INDEX_NAME, ITEMS_PER_PAGE } from "./constants";

interface SearchContainerProps {
  elasticsearchUrl: string;
}

export const SearchContainer: React.FC<SearchContainerProps> = ({
  elasticsearchUrl,
}) => {
  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      window.location.reload();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
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

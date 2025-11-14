import React, { useRef, useEffect, ForwardedRef, forwardRef } from 'react';
import type { estypes } from '@elastic/elasticsearch';
import ResultsError from './ResultsError';
import ResultsEmpty from './ResultsEmpty';
import ResultsHeader from './ResultsHeader';
import Pagination from './Pagination';
import { GhostList } from './GhostList';

type ResultsWrapperProps<T = any> = {
  currentPageIndex: number; // 0-based index
  customTotal?: number;
  data?: estypes.SearchResponse<T>;
  error?: Error | string | null;
  getHeaderText?: () => string | JSX.Element;
  isLoading: boolean;
  resultItemCallBack: (item: estypes.SearchHit<T>) => JSX.Element | null;
  setPageIndex: (pageIndex: number) => void; // 0-based index
  shouldScroll?: boolean;
  sortElement?: JSX.Element;
  itemsPerPage?: number;
};

export const ResultsWrapper = forwardRef(<T,>({
  currentPageIndex,
  customTotal,
  data,
  error,
  getHeaderText,
  isLoading,
  resultItemCallBack,
  setPageIndex,
  shouldScroll = false,
  sortElement,
  itemsPerPage = 20,
}: ResultsWrapperProps<T>, ref: ForwardedRef<HTMLHeadingElement>) => {
  const resultsRef = useRef<HTMLDivElement>(null);
  const previousPageRef = useRef<number>(currentPageIndex);

  // Scroll to results on page change
  useEffect(() => {
    if (shouldScroll && currentPageIndex !== previousPageRef.current) {
      setTimeout(() => {
        if (resultsRef.current) {
          const headerOffset = 100;
          const elementPosition = resultsRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
    previousPageRef.current = currentPageIndex;
  }, [currentPageIndex, shouldScroll]);

  const handlePageChange = (e: React.MouseEvent, pageIndex: number) => {
    e.preventDefault();
    setPageIndex(pageIndex); // Pass 0-based index directly
  };

  // Show loading on initial load
  if (isLoading && !data) {
    return (
      <div className="historia-search__results" ref={resultsRef}>
        <GhostList count={3} />
      </div>
    );
  }

  // Show error
  if (error) {
    return (
      <div className="historia-search__results" ref={resultsRef}>
        <ResultsError 
          error={error} 
          className="historia-search__error"
        />
      </div>
    );
  }

  // No data yet
  if (!data?.hits?.hits) {
    return null;
  }

  const results = data.hits.hits;
  const totalCount = customTotal !== undefined ? customTotal : (data.hits.total as estypes.SearchTotalHits).value;

  // Show empty state
  if (totalCount === 0 && !isLoading) {
    return (
      <div className="historia-search__results" ref={resultsRef}>
        <ResultsEmpty 
          wrapperClass="historia-search__results"
        />
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const headerText = getHeaderText ? getHeaderText() : `${totalCount}`;

  return (
    <div className="historia-search__results" ref={resultsRef}>
      <ResultsHeader
        resultText={<>{headerText}</>}
        actions={sortElement}
        actionsClass="historia-search__results-actions"
        ref={ref}
      />

      {/* Loading overlay during pagination */}
      {isLoading && (
        <div className="hdbt__loading-overlay">
          <GhostList count={3} />
        </div>
      )}

      {!isLoading && (
        <div className="results-list">
          {results.map((item) => resultItemCallBack(item))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          updatePage={handlePageChange}
          currentPage={currentPageIndex} // Pass 0-based index
          pages={5} // Number of page numbers to show
          totalPages={totalPages}
        />
      )}
    </div>
  );
});

ResultsWrapper.displayName = 'ResultsWrapper';

export default ResultsWrapper;


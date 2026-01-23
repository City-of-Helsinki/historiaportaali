import React, { useRef, useEffect, ForwardedRef, forwardRef } from 'react';
import type { estypes } from '@elastic/elasticsearch';
import ResultsError from './ResultsError';
import ResultsEmpty from './ResultsEmpty';
import ResultsHeader from './ResultsHeader';
import Pagination from './Pagination';
import { GhostList } from './GhostList';

type ResultsWrapperProps<T = any> = {
  currentPageIndex: number; // 0-based index
  data?: estypes.SearchResponse<T>;
  error?: Error | string | null;
  isLoading: boolean;
  resultItemCallBack: (item: estypes.SearchHit<T>) => JSX.Element | null;
  setPageIndex: (pageIndex: number) => void; // 0-based index
  shouldScroll?: boolean;
  sortElement?: JSX.Element;
  itemsPerPage?: number;
};

export const ResultsWrapper = forwardRef(<T,>({
  currentPageIndex,
  data,
  error,
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

  const loadingAnnouncement = Drupal.t('Loading results', {}, { context: 'Search' });

  // Show loading on initial load
  if (isLoading && !data) {
    return (
      <div className="historia-search__results" ref={resultsRef}>
        <div className="visually-hidden" aria-live="polite" aria-atomic="true">
          {loadingAnnouncement}
        </div>
        <GhostList />
      </div>
    );
  }

  // Show error
  if (error) {
    return (
      <div className="historia-search__results" ref={resultsRef}>
        <div className="visually-hidden" aria-live="polite" aria-atomic="true">
          {Drupal.t('Results could not be loaded', {}, { context: 'Search' })}
        </div>
        <ResultsError className="historia-search__error" />
      </div>
    );
  }

  // No data yet
  if (!data?.hits?.hits) {
    return null;
  }

  const results = data.hits.hits;
  const total = data.hits.total;
  const totalCount = typeof total === 'number' ? total : total?.value ?? 0;

  // Show empty state
  if (totalCount === 0 && !isLoading) {
    return (
      <div className="historia-search__results" ref={resultsRef}>
        <div className="visually-hidden" aria-live="polite" aria-atomic="true">
          {Drupal.formatPlural(
            totalCount,
            '1 result',
            '@count results',
            {},
            { context: 'Search' },
          )}
        </div>
        <ResultsEmpty 
          wrapperClass="historia-search__results"
        />
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const resultsLabel = Drupal.formatPlural(
    totalCount,
    '1 result',
    '@count results',
    {},
    { context: 'Search' },
  );
  const pageLabel = totalPages > 1
    ? Drupal.t('Page @current of @total', {
      '@current': currentPageIndex + 1,
      '@total': totalPages,
    }, { context: 'Search' })
    : '';
  const liveAnnouncement = isLoading
    ? loadingAnnouncement
    : pageLabel
      ? `${resultsLabel}. ${pageLabel}.`
      : `${resultsLabel}.`;
  return (
    <div className="historia-search__results" ref={resultsRef}>
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>
      <ResultsHeader
        resultText={
          <>
            {resultsLabel}
          </>
        }
        actions={sortElement}
        actionsClass="historia-search__results-actions"
        ref={ref}
      />

      {/* Loading overlay during pagination */}
      {isLoading && (
        <div className="hdbt__loading-overlay">
          <GhostList />
        </div>
      )}

      <div className="results-list" style={{ opacity: isLoading ? 0.5 : 1 }}>
        {results.map((item) => resultItemCallBack(item))}
      </div>

      {totalPages > 1 && (
        <Pagination
          updatePage={handlePageChange}
          currentPage={currentPageIndex} // Pass 0-based index
          totalPages={totalPages}
        />
      )}
    </div>
  );
});

ResultsWrapper.displayName = 'ResultsWrapper';

export default ResultsWrapper;


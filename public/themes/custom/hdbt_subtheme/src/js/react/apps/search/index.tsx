import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { ErrorBoundary } from './common/components/ErrorBoundary';
import { SearchContainer } from './modules/search/SearchContainer';
import ResultsError from './common/components/ResultsError';
import { GhostList } from './common/components/GhostList';

const ROOT_ID = 'historia_search';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById(ROOT_ID);

  if (!rootElement) {
    console.error('Root element not found for historia search app');
    return;
  }

  // Get Elasticsearch URL from data attribute or use default
  const elasticsearchUrl = rootElement.dataset.elasticsearchUrl || 'https://elastic-historiaportaali.docker.so';
  
  ReactDOM.render(
    <React.StrictMode>
      <ErrorBoundary fallback={<ResultsError />}>
        <Suspense fallback={<GhostList count={10} />}>
          <SearchContainer elasticsearchUrl={elasticsearchUrl} />
        </Suspense>
      </ErrorBoundary>
    </React.StrictMode>,
    rootElement
  );
});
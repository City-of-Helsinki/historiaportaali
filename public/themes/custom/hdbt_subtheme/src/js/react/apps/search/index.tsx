import React from 'react';
import ReactDOM from 'react-dom';
import { ErrorBoundary } from './common/components/ErrorBoundary';
import { SearchContainer } from './modules/search/SearchContainer';
import ResultsError from './common/components/ResultsError';

const ROOT_ID = 'historia_search';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById(ROOT_ID);

  if (!rootElement) {
    console.error('Root element not found for historia search app');
    return;
  }

  console.log('rootElement', rootElement);

  // Get Elasticsearch URL from data attribute
  const elasticsearchUrl = rootElement.dataset.elasticsearchUrl;

  if (!elasticsearchUrl) {
    console.error('Elasticsearch URL missing from data-elasticsearch-url');
    return;
  }
  
  ReactDOM.render(
    <React.StrictMode>
      <ErrorBoundary fallback={<ResultsError />}>
        <SearchContainer elasticsearchUrl={elasticsearchUrl} />
      </ErrorBoundary>
    </React.StrictMode>,
    rootElement
  );
});
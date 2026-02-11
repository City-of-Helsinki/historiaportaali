import React from "react";
import ReactDOM from "react-dom";
import { ErrorBoundary } from "./common/components/ErrorBoundary";
import { SearchContainer } from "./modules/search/SearchContainer";
import ResultsError from "./common/components/ResultsError";

document.addEventListener("DOMContentLoaded", () => {
  const rootElementId = "historia_search";
  const rootElement = document.getElementById(rootElementId);

  if (!rootElement) {
    console.error(`Root element not found for #${rootElementId}`);
    return;
  }

  const elasticsearchUrl = rootElement.dataset.elasticsearchUrl?.trim();

  if (!elasticsearchUrl) {
    console.error(
      `Elasticsearch URL missing from data-elasticsearch-url on #${rootElementId}`,
    );
    return;
  }

  ReactDOM.render(
    <React.StrictMode>
      <ErrorBoundary fallback={<ResultsError />}>
        <SearchContainer elasticsearchUrl={elasticsearchUrl} />
      </ErrorBoundary>
    </React.StrictMode>,
    rootElement,
  );
});

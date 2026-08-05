import React from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./common/components/ErrorBoundary";
import { SearchContainer } from "./modules/search/SearchContainer";
import ResultsError from "./common/components/ResultsError";
import { getElasticUrl } from "./common/helpers/getElasticUrl";

document.addEventListener("DOMContentLoaded", () => {
  const rootElementId = "historia_search";
  const rootElement = document.getElementById(rootElementId);

  if (!rootElement) {
    console.error(`Root element not found for #${rootElementId}`);
    return;
  }

  const elasticsearchUrl = getElasticUrl(rootElement);

  if (!elasticsearchUrl) {
    console.error(
      `Elasticsearch URL missing from data-elasticsearch-url on #${rootElementId}`,
    );
    return;
  }

  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary fallback={<ResultsError />}>
        <SearchContainer elasticsearchUrl={elasticsearchUrl} />
      </ErrorBoundary>
    </React.StrictMode>,
  );
});

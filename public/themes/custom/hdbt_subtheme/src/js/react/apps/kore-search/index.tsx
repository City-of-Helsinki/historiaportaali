import React from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "../search/common/components/ErrorBoundary";
import { KoreSearchContainer } from "./KoreSearchContainer";
import ResultsError from "../search/common/components/ResultsError";
import { getElasticUrl } from "../search/common/helpers/getElasticUrl";

document.addEventListener("DOMContentLoaded", () => {
  const rootElementId = "historia_kore_search";
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
        <KoreSearchContainer elasticsearchUrl={elasticsearchUrl} />
      </ErrorBoundary>
    </React.StrictMode>,
  );
});

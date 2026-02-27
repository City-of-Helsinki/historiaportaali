import { useEffect } from "react";
import { KoreSearchForm } from "./components/KoreSearchForm";
import { KoreResultsContainer } from "./containers/KoreResultsContainer";
import { INDEX_NAME, ITEMS_PER_PAGE } from "./constants";

interface KoreSearchContainerProps {
  elasticsearchUrl: string;
}

export const KoreSearchContainer: React.FC<KoreSearchContainerProps> = ({
  elasticsearchUrl,
}) => {
  useEffect(() => {
    const handlePopState = () => {
      window.location.reload();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="historia-search kore-search">
      <KoreSearchForm />
      <KoreResultsContainer
        url={elasticsearchUrl}
        indexName={INDEX_NAME}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </div>
  );
};

export default KoreSearchContainer;

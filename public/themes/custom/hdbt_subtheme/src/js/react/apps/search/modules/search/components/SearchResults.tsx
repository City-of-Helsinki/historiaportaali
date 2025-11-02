import React from 'react';
import { useAtomValue } from 'jotai';
import { ContentItem } from '../../../common/types/Content';
import { GhostList } from '../../../common/components/GhostList';
import ResultsError from '../../../common/components/ResultsError';
import { t } from '../../../common/utils/translate';
import { searchFiltersAtom } from '../store';

interface SearchResultsProps {
  results: ContentItem[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  error: string | null;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  totalCount,
  currentPage,
  itemsPerPage,
  onPageChange,
  loading,
  error
}) => {
  const filters = useAtomValue(searchFiltersAtom);

  if (error) {
    return <ResultsError />;
  }

  if (loading) {
    return <GhostList count={itemsPerPage} />;
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="historia-search__results">
      <div className="results-summary">
        <p>{t("Found @count results", {"@count": String(totalCount)}, {context: "Search"})}</p>
      </div>

      <div className="results-list">
        {results.map((item, index) => (
          <div key={item.nid || item.mid || index} className="result-item">
            {/* Hide image for now to make testing easier */}
            {/* {item.image_url && (
              <div className="result-image">
                <img src={item.image_url} alt={item.title} loading="lazy" />
              </div>
            )} */}
            <div className="result-content">
              <h3 className="result-title">
                <a href={item.url}>{item.title}</a>
              </h3>
              
              <div className="result-meta">
                {item.start_year && item.end_year && (
                  <span className="result-years">
                    {item.start_year === item.end_year 
                      ? item.start_year 
                      : `${item.start_year} - ${item.end_year}`}
                  </span>
                )}
                
                {item.formats && item.formats.length > 0 && (
                  <div className="result-formats">
                    <strong>{t("Format:", {}, {context: "Search"})}</strong> {item.formats.join(', ')}
                  </div>
                )}
                
                {item.phenomena && item.phenomena.length > 0 && (
                  <div className="result-phenomena">
                    <strong>{t("Phenomena", {}, {context: "Search"})}:</strong> {item.phenomena.join(', ')}
                  </div>
                )}
                
                {item.neighbourhoods && item.neighbourhoods.length > 0 && (
                  <div className="result-neighbourhoods">
                    <strong>{t("Region", {}, {context: "Search"})}:</strong> {item.neighbourhoods.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            {t("Previous", {}, {context: "Search"})}
          </button>
          
          <span className="pagination-info">
            {t("Page @current / @total", {"@current": String(currentPage), "@total": String(totalPages)}, {context: "Search"})}
          </span>
          
          <button 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="pagination-button"
          >
            {t("Next", {}, {context: "Search"})}
          </button>
        </div>
      )}
    </div>
  );
};

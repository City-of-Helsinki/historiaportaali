import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Facet } from '../../../common/types/Content';
import { t } from '../../../common/utils/translate';
import { 
  keywordsAtom, 
  setKeywordsAtom, 
  startYearAtom, 
  setStartYearAtom, 
  endYearAtom, 
  setEndYearAtom,
  stagedFiltersAtom,
  urlUpdateAtom,
  resetFormAtom
} from '../store';

interface SearchFormProps {
  facets?: Facet[];
  loading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ 
  facets, 
  loading 
}) => {
  const keywords = useAtomValue(keywordsAtom);
  const setKeywords = useSetAtom(setKeywordsAtom);
  const startYear = useAtomValue(startYearAtom);
  const setStartYear = useSetAtom(setStartYearAtom);
  const endYear = useAtomValue(endYearAtom);
  const setEndYear = useSetAtom(setEndYearAtom);
  const stagedFilters = useAtomValue(stagedFiltersAtom);
  const setUrlParams = useSetAtom(urlUpdateAtom);
  const resetForm = useSetAtom(resetFormAtom);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL with staged filters, reset page to 1 for new search
    const { page, ...filtersWithoutPage } = stagedFilters;
    setUrlParams(filtersWithoutPage);
  };

  const handleReset = () => {
    setKeywords('');
    setStartYear('');
    setEndYear('');
    resetForm();
  };

  return (
    <div className="historia-search__form">
      <form onSubmit={handleSubmit}>
        <div className="search-input-group">
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={t("Location, person, topic, event...", {}, {context: "Search"})}
            className="search-input"
            disabled={loading}
          />
        </div>

        <div className="search-filters">
          <div className="year-filters">
            <label>
              {t("Start year", {}, {context: "Search"})}: 
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                placeholder={t("e.g. 1900", {}, {context: "Search"})}
                min="1400"
                max={new Date().getFullYear()}
                disabled={loading}
              />
            </label>
            <label>
              {t("End year", {}, {context: "Search"})}:
              <input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                placeholder={t("e.g. 2000", {}, {context: "Search"})}
                min="1400"
                max={new Date().getFullYear()}
                disabled={loading}
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="search-button">
              {loading 
                ? t("Searching...", {}, {context: "Search"}) 
                : t("Search", {}, {context: "Search"})
              }
            </button>
            <button type="button" onClick={handleReset} className="reset-button">
              {t("Clear filters", {}, {context: "Search"})}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

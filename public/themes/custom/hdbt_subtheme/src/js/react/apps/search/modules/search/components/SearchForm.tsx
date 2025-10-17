import React, { useState } from 'react';
import { SearchFilters, Facet } from '../../../common/types/Content';

interface SearchFormProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  facets?: Facet[];
  loading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ 
  filters, 
  onFiltersChange, 
  facets, 
  loading 
}) => {
  const [localKeywords, setLocalKeywords] = useState(filters.keywords);
  const [localStartYear, setLocalStartYear] = useState(filters.startYear?.toString() || '');
  const [localEndYear, setLocalEndYear] = useState(filters.endYear?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onFiltersChange({
      ...filters,
      keywords: localKeywords,
      startYear: localStartYear ? parseInt(localStartYear) : undefined,
      endYear: localEndYear ? parseInt(localEndYear) : undefined
    });
  };

  const handleFacetChange = (facetName: string, value: string, checked: boolean) => {
    const currentValues = filters[facetName as keyof SearchFilters] as string[] || [];
    
    let newValues: string[];
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }

    onFiltersChange({
      ...filters,
      [facetName]: newValues
    });
  };

  const handleReset = () => {
    setLocalKeywords('');
    setLocalStartYear('');
    setLocalEndYear('');
    onFiltersChange({
      keywords: '',
      startYear: undefined,
      endYear: undefined,
      formats: [],
      phenomena: [],
      neighbourhoods: []
    });
  };


  return (
    <div className="historia-search__form">
      <form onSubmit={handleSubmit}>
        <div className="search-input-group">
          <input
            type="text"
            value={localKeywords}
            onChange={(e) => setLocalKeywords(e.target.value)}
            placeholder={window.Drupal?.t("Location, person, topic, event...", {}, {context: "Search"})}
            className="search-input"
            disabled={loading}
          />
        </div>

        <div className="search-filters">
          <div className="year-filters">
            <label>
              {window.Drupal?.t("Start year", {}, {context: "Search"})}: 
              <input
                type="number"
                value={localStartYear}
                onChange={(e) => setLocalStartYear(e.target.value)}
                placeholder={window.Drupal?.t("e.g. 1900", {}, {context: "Search"})}
                min="1400"
                max={new Date().getFullYear()}
                disabled={loading}
              />
            </label>
            <label>
              {window.Drupal?.t("End year", {}, {context: "Search"})}:
              <input
                type="number"
                value={localEndYear}
                onChange={(e) => setLocalEndYear(e.target.value)}
                placeholder={window.Drupal?.t("e.g. 2000", {}, {context: "Search"})}
                min="1400"
                max={new Date().getFullYear()}
                disabled={loading}
              />
            </label>
          </div>


          <div className="form-actions">
            <button type="submit" disabled={loading} className="search-button">
              {loading 
                ? window.Drupal?.t("Searching...", {}, {context: "Search"}) 
                : window.Drupal?.t("Search", {}, {context: "Search"})
              }
            </button>
            <button type="button" onClick={handleReset} className="reset-button">
              {window.Drupal?.t("Clear filters", {}, {context: "Search"})}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { SearchInput, Button, ButtonVariant, DateInput } from 'hds-react';
import { Facet } from '../../../common/types/Content';
import { t } from '../../../common/utils/translate';
import { 
  keywordsAtom, 
  setKeywordsAtom, 
  startYearAtom, 
  setStartYearAtom, 
  endYearAtom, 
  setEndYearAtom,
  phenomenaAtom,
  setPhenomenaAtom,
  formatsAtom,
  setFormatsAtom,
  neighbourhoodsAtom,
  setNeighbourhoodsAtom,
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
  const phenomena = useAtomValue(phenomenaAtom);
  const setPhenomena = useSetAtom(setPhenomenaAtom);
  const formats = useAtomValue(formatsAtom);
  const setFormats = useSetAtom(setFormatsAtom);
  const neighbourhoods = useAtomValue(neighbourhoodsAtom);
  const setNeighbourhoods = useSetAtom(setNeighbourhoodsAtom);
  const stagedFilters = useAtomValue(stagedFiltersAtom);
  const setUrlParams = useSetAtom(urlUpdateAtom);
  const resetForm = useSetAtom(resetFormAtom);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { page, ...filtersWithoutPage } = stagedFilters;
    setUrlParams(filtersWithoutPage);
  };

  const handleSearchSubmit = () => {
    const { page, ...filtersWithoutPage } = stagedFilters;
    setUrlParams(filtersWithoutPage);
  };

  // Generic handler for toggling array filter values
  const toggleArrayFilter = (currentValues: string[], value: string, setter: (values: string[]) => void) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setter(newValues);
  };

  const phenomenaFacet = facets?.find(f => f.name === 'aggregated_phenomena_title');
  const formatsFacet = facets?.find(f => f.name === 'aggregated_formats_title');
  const neighbourhoodsFacet = facets?.find(f => f.name === 'aggregated_neighbourhoods_title');

  return (
    <div className="historia-search__form">
      <form onSubmit={handleSubmit}>
        <div className="search-input-group">
          <SearchInput
            label={t("Search", {}, {context: "Search"})}
            value={Array.isArray(keywords) ? keywords.join(' ') : keywords}
            onChange={(value) => setKeywords(value)}
            onSubmit={handleSearchSubmit}
            placeholder={t("Location, person, topic, event...", {}, {context: "Search"})}
            className="search-input"
            searchButtonAriaLabel={t("Search", {}, {context: "Search"})}
            clearButtonAriaLabel={t("Clear search", {}, {context: "Search"})}
          />
        </div>

        <div className="search-filters">
          <div className="year-filters">
            <DateInput
              id="search-start-year"
              label={t("Start year", {}, {context: "Search"})}
              value={Array.isArray(startYear) ? startYear[0] : startYear}
              onChange={(value) => setStartYear(value)}
              clearButton
              disableDatePicker
              dateFormat="yyyy"
              placeholder={t("e.g. 1900", {}, {context: "Search"})}
            />
            <DateInput
              id="search-end-year"
              label={t("End year", {}, {context: "Search"})}
              value={Array.isArray(endYear) ? endYear[0] : endYear}
              onChange={(value) => setEndYear(value)}
              clearButton
              disableDatePicker
              dateFormat="yyyy"
              placeholder={t("e.g. 2000", {}, {context: "Search"})}
            />
          </div>
          {formatsFacet && (
            <div className="formats-filters">
              <fieldset disabled={loading}>
                <legend>{t("Formats", {}, {context: "Search"})}</legend>
                <div className="checkbox-group">
                  {formatsFacet.values.map((facetValue) => (
                    <label key={facetValue.filter} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formats.includes(facetValue.filter)}
                        onChange={() => toggleArrayFilter(formats, facetValue.filter, setFormats)}
                        disabled={loading}
                      />
                      <span>{facetValue.filter} ({facetValue.count})</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {phenomenaFacet && (
            <div className="phenomena-filters">
              <fieldset disabled={loading}>
                <legend>{t("Phenomena", {}, {context: "Search"})}</legend>
                <div className="checkbox-group">
                  {phenomenaFacet.values.map((facetValue) => (
                    <label key={facetValue.filter} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={phenomena.includes(facetValue.filter)}
                        onChange={() => toggleArrayFilter(phenomena, facetValue.filter, setPhenomena)}
                        disabled={loading}
                      />
                      <span>{facetValue.filter} ({facetValue.count})</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {neighbourhoodsFacet && (
            <div className="neighbourhoods-filters">
              <fieldset disabled={loading}>
                <legend>{t("Region", {}, {context: "Search"})}</legend>
                <div className="checkbox-group">
                  {neighbourhoodsFacet.values.map((facetValue) => (
                    <label key={facetValue.filter} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={neighbourhoods.includes(facetValue.filter)}
                        onChange={() => toggleArrayFilter(neighbourhoods, facetValue.filter, setNeighbourhoods)}
                        disabled={loading}
                      />
                      <span>{facetValue.filter} ({facetValue.count})</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          <div className="form-actions">
            <Button type="submit" disabled={loading} className="search-button">
              {loading 
                ? t("Searching...", {}, {context: "Search"}) 
                : t("Search", {}, {context: "Search"})
              }
            </Button>
            <Button type="button" onClick={resetForm} variant={ButtonVariant.Secondary} className="reset-button">
              {t("Clear filters", {}, {context: "Search"})}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

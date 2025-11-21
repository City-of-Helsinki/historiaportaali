import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { SearchInput, Button, ButtonVariant, DateInput, Select, IconCross, Fieldset } from 'hds-react';
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
  resetFormAtom,
  facetsAtom,
  isLoadingFacetsAtom
} from '../store';

export const SearchForm: React.FC = () => {
  const facets = useAtomValue(facetsAtom);
  const loading = useAtomValue(isLoadingFacetsAtom);
  const language = drupalSettings?.path?.currentLanguage || 'fi';
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

  const phenomenaFacet = facets?.find(f => f.name === 'aggregated_phenomena_title');
  const formatsFacet = facets?.find(f => f.name === 'aggregated_formats_title');
  const neighbourhoodsFacet = facets?.find(f => f.name === 'aggregated_neighbourhoods_title');

  const hasActiveFilters = !!(
    (keywords && keywords.length > 0) ||
    startYear ||
    endYear ||
    (phenomena && phenomena.length > 0) ||
    (formats && formats.length > 0) ||
    (neighbourhoods && neighbourhoods.length > 0)
  );

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

        <div className="searchFilters">
          <Fieldset 
            heading={t("Select era", {}, {context: "Search"})}
            className="filterGroup dateFilters"
          >
            <div className="dateFilters-inputs">
              <DateInput
                id="search-start-year"
                label={t("Start year", {}, {context: "Search"})}
                value={Array.isArray(startYear) ? startYear[0] : startYear}
                onChange={(value) => setStartYear(value)}
                clearButton
                disableDatePicker
                dateFormat="yyyy"
                placeholder={t("e.g.") + " 1900" }
                language={language}
                helperText={t("Enter a year", {}, {context: "Search"})}
              />
              <DateInput
                id="search-end-year"
                label={t("End year", {}, {context: "Search"})}
                value={Array.isArray(endYear) ? endYear[0] : endYear}
                onChange={(value) => setEndYear(value)}
                clearButton
                disableDatePicker
                dateFormat="yyyy"
                placeholder={t("e.g.") + " 2000"}
                language={language}
                helperText={t("Enter a year", {}, {context: "Search"})}
              />
            </div>
          </Fieldset>

          {neighbourhoodsFacet && (
            <div className="filterGroup neighbourhoodsFilters">
              <Select
                id="neighbourhoods-select"
                multiSelect
                options={neighbourhoodsFacet.values.map(facetValue => ({
                  label: `${facetValue.filter} (${facetValue.count})`,
                  value: facetValue.filter
                }))}
                value={neighbourhoods}
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions.map(opt => opt.value);
                  setNeighbourhoods(selectedValues);
                }}
                {...(neighbourhoodsFacet.values.length >= 10 && {
                  filter: (option, filterStr) => {
                    return option.label.toLowerCase().includes(filterStr.toLowerCase());
                  }
                })}
                texts={{
                  label: t("Region", {}, {context: "Search"}),
                  language: language,
                  placeholder: t("Select region", {}, {context: "Search"}),
                  ...(neighbourhoodsFacet.values.length >= 10 && {
                    filterPlaceholder: t("Filter", {}, {context: "Search"}),
                  }),
                }}
                disabled={loading}
              />
            </div>
          )}

          {formatsFacet && (
            <div className="filterGroup formatsFilters">
              <Select
                id="formats-select"
                multiSelect
                options={formatsFacet.values.map(facetValue => ({
                  label: `${facetValue.filter} (${facetValue.count})`,
                  value: facetValue.filter
                }))}
                value={formats}
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions.map(opt => opt.value);
                  setFormats(selectedValues);
                }}
                {...(formatsFacet.values.length >= 10 && {
                  filter: (option, filterStr) => {
                    return option.label.toLowerCase().includes(filterStr.toLowerCase());
                  }
                })}
                texts={{
                  label: t("Format", {}, {context: "Search"}),
                  language: language,
                  placeholder: t("Select format", {}, {context: "Search"}),
                  ...(formatsFacet.values.length >= 10 && {
                    filterPlaceholder: t("Filter", {}, {context: "Search"}),
                  }),
                }}
                disabled={loading}
              />
            </div>
          )}

          {phenomenaFacet && (
            <div className="filterGroup phenomenaFilters">
              <Select
                id="phenomena-select"
                multiSelect
                options={phenomenaFacet.values.map(facetValue => ({
                  label: `${facetValue.filter} (${facetValue.count})`,
                  value: facetValue.filter
                }))}
                value={phenomena}
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions.map(opt => opt.value);
                  setPhenomena(selectedValues);
                }}
                {...(phenomenaFacet.values.length >= 10 && {
                  filter: (option, filterStr) => {
                    return option.label.toLowerCase().includes(filterStr.toLowerCase());
                  }
                })}
                texts={{
                  label: t("Phenomenon", {}, {context: "Search"}),
                  language: language,
                  placeholder: t("Select phenomenon", {}, {context: "Search"}),
                  ...(phenomenaFacet.values.length >= 10 && {
                    filterPlaceholder: t("Filter", {}, {context: "Search"}),
                  }),
                }}
                disabled={loading}
              />
            </div>
          )}


          <div className="form-actions">
            <Button
              type="submit"
              disabled={loading}
              className="search-button">
              {loading 
                ? t("Searching...", {}, {context: "Search"}) 
                : t("Search", {}, {context: "Search"})
              }
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                onClick={resetForm}
                variant={ButtonVariant.Supplementary}
                className="reset-button"
                iconStart={<IconCross />}
              >
                {t("Clear", {}, {context: "Search"})}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

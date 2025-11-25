import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  SearchInput,
  Button,
  ButtonVariant,
  ButtonPresetTheme,
  TextInput,
  Select,
  IconCross,
  IconPhoto,
  IconLayers,
  Tooltip
} from 'hds-react';
import { t } from '../../../common/utils/translate';
import { defaultMultiSelectTheme } from '@/react/common/constants/selectTheme';
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

  // Helper to ensure year is a string (TypeScript workaround for generic atom types)
  const asString = (value: string | string[] | undefined): string =>
    Array.isArray(value) ? value[0] || '' : value || '';

  // Helper to validate and limit year input to 4 digits (allows negative for BC years)
  const handleYearChange = (value: string, setter: (value: string) => void) => {
    const match = value.match(/^-?\d{0,4}$/);
    if (match) setter(value);
  };

  // Common year input props
  const commonYearInputProps = {
    type: 'text' as const,
    inputMode: 'numeric' as const,
    clearButton: true,
    tooltip: (
      <Tooltip
        tooltipLabel={t("Year format help", {}, {context: "Search"})}
        buttonLabel={t("Help", {}, {context: "Search"})}
        small
        boxShadow
        placement="bottom-start"
      >
        {t("Use negative numbers for BC/BCE (e.g. -2050)", {}, {context: "Search"})}
      </Tooltip>
    )
  };

  const phenomenaFacet = facets?.find(f => f.name === 'aggregated_phenomena_title');
  const formatsFacet = facets?.find(f => f.name === 'aggregated_formats_title');
  const neighbourhoodsFacet = facets?.find(f => f.name === 'aggregated_neighbourhoods_title');

  const hasActiveFilters = !!(
    (keywords && keywords.length > 0) ||
    (startYear !== undefined && startYear !== null && startYear !== '') ||
    (endYear !== undefined && endYear !== null && endYear !== '') ||
    (phenomena && phenomena.length > 0) ||
    (formats && formats.length > 0) ||
    (neighbourhoods && neighbourhoods.length > 0)
  );

  return (
    <div className="historia-search__form">
      <form onSubmit={handleSubmit}>
        <div className="react-search-keyword">
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

        <h2 className="visually-hidden">{t("Filter results", {}, {context: "Search"})}</h2>

        <div className="react-search-filters">
          <div className="filter-group filter-group--dates">
            <div className="date-filter-inputs">
              <TextInput
                {...commonYearInputProps}
                id="search-start-year"
                label={t("From year", {}, {context: "Search"})}
                value={asString(startYear)}
                onChange={(e) => handleYearChange(e.target.value, setStartYear)}
                placeholder={t("e.g.") + " 1900"}
                clearButtonAriaLabel={t("Clear from year", {}, {context: "Search"})}
              />
              <TextInput
                {...commonYearInputProps}
                id="search-end-year"
                label={t("Until year", {}, {context: "Search"})}
                value={asString(endYear)}
                onChange={(e) => handleYearChange(e.target.value, setEndYear)}
                placeholder={t("e.g.") + " 2000"}
                clearButtonAriaLabel={t("Clear until year", {}, {context: "Search"})}
              />
            </div>
          </div>

          {neighbourhoodsFacet && (
            <div className="filter-group filter-group--neighbourhoods">
              <Select
                id="neighbourhoods-select"
                multiSelect
                options={neighbourhoodsFacet.values.map(facetValue => ({
                  label: `${facetValue.filter} (${facetValue.count})`,
                  value: facetValue.filter
                }))}
                value={neighbourhoods}
                noTags
                clearable
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
                theme={defaultMultiSelectTheme}
                disabled={loading}
              />
            </div>
          )}

          {formatsFacet && (
            <div className="filter-group filter-group--formats">
              <Select
                id="formats-select"
                multiSelect
                options={formatsFacet.values.map(facetValue => ({
                  label: `${facetValue.filter} (${facetValue.count})`,
                  value: facetValue.filter
                }))}
                value={formats}
                noTags
                clearable
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions.map(opt => opt.value);
                  setFormats(selectedValues);
                }}
                {...(formatsFacet.values.length >= 10 && {
                  filter: (option, filterStr) => {
                    return option.label.toLowerCase().includes(filterStr.toLowerCase());
                  }
                })}
                icon={<IconPhoto />}
                texts={{
                  label: t("Format", {}, {context: "Search"}),
                  language: language,
                  placeholder: t("Select format", {}, {context: "Search"}),
                  ...(formatsFacet.values.length >= 10 && {
                    filterPlaceholder: t("Filter", {}, {context: "Search"}),
                  }),
                }}
                theme={defaultMultiSelectTheme}
                disabled={loading}
              />
            </div>
          )}

          {phenomenaFacet && (
            <div className="filter-group filter-group--phenomena">
              <Select
                id="phenomena-select"
                multiSelect
                options={phenomenaFacet.values.map(facetValue => ({
                  label: `${facetValue.filter} (${facetValue.count})`,
                  value: facetValue.filter
                }))}
                value={phenomena}
                noTags
                clearable
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions.map(opt => opt.value);
                  setPhenomena(selectedValues);
                }}
                {...(phenomenaFacet.values.length >= 10 && {
                  filter: (option, filterStr) => {
                    return option.label.toLowerCase().includes(filterStr.toLowerCase());
                  }
                })}
                icon={<IconLayers />}
                texts={{
                  label: t("Phenomenon", {}, {context: "Search"}),
                  language: language,
                  placeholder: t("Select phenomenon", {}, {context: "Search"}),
                  ...(phenomenaFacet.values.length >= 10 && {
                    filterPlaceholder: t("Filter", {}, {context: "Search"}),
                  }),
                }}
                theme={defaultMultiSelectTheme}
                disabled={loading}
              />
            </div>
          )}


          <div className="form-actions">
            <Button
              type="submit"
              disabled={loading}
              theme={ButtonPresetTheme.Black}>
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
                theme={ButtonPresetTheme.Black}
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

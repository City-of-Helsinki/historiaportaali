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
  IconLocation,
  IconPhoto,
  IconLayers,
  Tooltip
} from 'hds-react';
import { defaultMultiSelectTheme } from '@/react/common/constants/selectTheme';
import type { Facet } from '../../../common/types/Content';
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

  const submitFilters = () => {
    const { page, ...filtersWithoutPage } = stagedFilters;
    setUrlParams(filtersWithoutPage);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFilters();
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
        tooltipLabel={Drupal.t("Year format help", {}, {context: "Search"})}
        buttonLabel={Drupal.t("Help", {}, {context: "Search"})}
        small
        boxShadow
        placement="bottom-start"
      >
        {Drupal.t("Use negative numbers for BC/BCE (e.g. -2050)", {}, {context: "Search"})}
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

  const renderFacetSelect = ({
    facet,
    wrapperClass,
    id,
    label,
    placeholder,
    icon,
    value,
    onChange,
  }: {
    facet?: Facet;
    wrapperClass: string;
    id: string;
    label: string;
    placeholder: string;
    icon?: React.ReactElement;
    value: string[];
    onChange: (values: string[]) => void;
  }) => {
    if (!facet) return null;
    // Show filterable input only when there number of options exceed this.
    const showFilter = facet.values.length >= 10;
    return (
      <div className={wrapperClass}>
        <Select
          id={id}
          multiSelect
          options={facet.values.map((facetValue) => ({
            label: `${facetValue.filter} (${facetValue.count})`,
            value: facetValue.filter
          }))}
          value={value}
          noTags
          clearable
          onChange={(selectedOptions) => {
            const selectedValues = selectedOptions.map((opt) => opt.value);
            onChange(selectedValues);
          }}
          {...(showFilter && {
            filter: (option, filterStr) => {
              return option.label.toLowerCase().includes(filterStr.toLowerCase());
            }
          })}
          icon={icon}
          texts={{
            label,
            language: language,
            placeholder,
            ...(showFilter && {
              filterPlaceholder: Drupal.t("Filter", {}, {context: "Search"}),
            }),
          }}
          theme={defaultMultiSelectTheme}
          disabled={loading}
        />
      </div>
    );
  };

  return (
    <div className="historia-search__form">
      <form onSubmit={handleSubmit}>
        <div className="react-search-keyword">
          <SearchInput
            label={Drupal.t("Search", {}, {context: "Search"})}
            value={Array.isArray(keywords) ? keywords.join(' ') : keywords}
            onChange={(value) => setKeywords(value)}
            onSubmit={submitFilters}
            placeholder={Drupal.t("Location, person, topic, event...", {}, {context: "Search"})}
            className="search-input"
            searchButtonAriaLabel={Drupal.t("Search", {}, {context: "Search"})}
            clearButtonAriaLabel={Drupal.t("Clear search", {}, {context: "Search"})}
          />
        </div>

        <h2 className="visually-hidden">{Drupal.t("Filter results", {}, {context: "Search"})}</h2>

        <div className="react-search-filters">
          <div className="filter-group filter-group--dates">
            <div className="date-filter-inputs">
              <TextInput
                {...commonYearInputProps}
                id="search-start-year"
                label={Drupal.t("From year", {}, {context: "Search"})}
                value={asString(startYear)}
                onChange={(e) => handleYearChange(e.target.value, setStartYear)}
                placeholder={Drupal.t("e.g.") + " 1900"}
                clearButtonAriaLabel={Drupal.t("Clear from year", {}, {context: "Search"})}
              />
              <TextInput
                {...commonYearInputProps}
                id="search-end-year"
                label={Drupal.t("Until year", {}, {context: "Search"})}
                value={asString(endYear)}
                onChange={(e) => handleYearChange(e.target.value, setEndYear)}
                placeholder={Drupal.t("e.g.") + " 2000"}
                clearButtonAriaLabel={Drupal.t("Clear until year", {}, {context: "Search"})}
              />
            </div>
          </div>

          {renderFacetSelect({
            facet: neighbourhoodsFacet,
            wrapperClass: "filter-group filter-group--neighbourhoods",
            id: "neighbourhoods-select",
            label: Drupal.t("Region", {}, {context: "Search"}),
            placeholder: Drupal.t("Select region", {}, {context: "Search"}),
            icon: <IconLocation />,
            value: neighbourhoods,
            onChange: setNeighbourhoods,
          })}

          {renderFacetSelect({
            facet: formatsFacet,
            wrapperClass: "filter-group filter-group--formats",
            id: "formats-select",
            label: Drupal.t("Format", {}, {context: "Search"}),
            placeholder: Drupal.t("Select format", {}, {context: "Search"}),
            icon: <IconPhoto />,
            value: formats,
            onChange: setFormats,
          })}

          {renderFacetSelect({
            facet: phenomenaFacet,
            wrapperClass: "filter-group filter-group--phenomena",
            id: "phenomena-select",
            label: Drupal.t("Phenomenon", {}, {context: "Search"}),
            placeholder: Drupal.t("Select phenomenon", {}, {context: "Search"}),
            icon: <IconLayers />,
            value: phenomena,
            onChange: setPhenomena,
          })}


          <div className="form-actions">
            <Button
              type="submit"
              disabled={loading}
              theme={ButtonPresetTheme.Black}>
              {loading 
                ? Drupal.t("Searching...", {}, {context: "Search"}) 
                : Drupal.t("Search", {}, {context: "Search"})
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
                {Drupal.t("Clear", {}, {context: "Search"})}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

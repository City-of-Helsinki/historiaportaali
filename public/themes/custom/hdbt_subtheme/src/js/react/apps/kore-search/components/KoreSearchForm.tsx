import type React from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useState, useEffect } from "react";
import {
  SearchInput,
  Button,
  ButtonVariant,
  ButtonPresetTheme,
  Select,
  IconCross,
} from "hds-react";
import { YearRangeInput } from "./YearRangeInput";
import type { Facet } from "../types/Content";
import {
  keywordsAtom,
  setKeywordsAtom,
  startYearAtom,
  setStartYearAtom,
  endYearAtom,
  setEndYearAtom,
  typeFilterAtom,
  setTypeFilterAtom,
  languageFilterAtom,
  setLanguageFilterAtom,
  stagedFiltersAtom,
  urlUpdateAtom,
  resetFormAtom,
  facetsAtom,
  isLoadingFacetsAtom,
} from "../store";

// TODO: read the possible minimum year from index, though 1550 is anyways the year Helsinki was established so this might be fine.
const YEAR_MIN = 1550;
const YEAR_MAX = new Date().getFullYear();

export const KoreSearchForm: React.FC = () => {
  const facets = useAtomValue(facetsAtom);
  const loading = useAtomValue(isLoadingFacetsAtom);
  const language = drupalSettings?.path?.currentLanguage || "fi";
  const typeOptions = drupalSettings?.koreSearch?.typeOptions ?? [];
  const languageOptions = drupalSettings?.koreSearch?.languageOptions ?? [];
  const keywords = useAtomValue(keywordsAtom);
  const setKeywords = useSetAtom(setKeywordsAtom);
  const startYear = useAtomValue(startYearAtom);
  const setStartYear = useSetAtom(setStartYearAtom);
  const endYear = useAtomValue(endYearAtom);
  const setEndYear = useSetAtom(setEndYearAtom);
  const typeFilter = useAtomValue(typeFilterAtom);
  const setTypeFilter = useSetAtom(setTypeFilterAtom);
  const languageFilter = useAtomValue(languageFilterAtom);
  const setLanguageFilter = useSetAtom(setLanguageFilterAtom);
  const stagedFilters = useAtomValue(stagedFiltersAtom);
  const setUrlParams = useSetAtom(urlUpdateAtom);
  const resetForm = useSetAtom(resetFormAtom);

  const submitFilters = (overrides?: Partial<typeof stagedFilters>) => {
    const merged = { ...stagedFilters, ...overrides };
    const { page, ...filtersWithoutPage } = merged;
    setUrlParams({ ...filtersWithoutPage, page: "1" });
  };

  const [filterAnnouncement, setFilterAnnouncement] = useState("");
  useEffect(() => {
    if (!loading && filterAnnouncement) {
      const id = setTimeout(() => setFilterAnnouncement(""), 500);
      return () => clearTimeout(id);
    }
  }, [loading, filterAnnouncement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFilters();
  };

  const asString = (value: string | string[] | undefined): string =>
    Array.isArray(value) ? value[0] || "" : value || "";

  const searchingAnnouncement = Drupal.t(
    "Searching...",
    {},
    { context: "Kore search" },
  );

  // Handle input change by updating the state and submitting filters if user clears input.
  const handleInputChange = (
    value: string | string[],
    updateState: (v: string) => void,
    urlKey: keyof typeof stagedFilters,
  ) => {
    const str = typeof value === "string" ? value : (value ?? []).join(" ");
    updateState(str);
    if (str.trim() === "") {
      submitFilters({ [urlKey]: "" });
      setFilterAnnouncement(searchingAnnouncement);
    }
  };

  const koreTypeFacet = facets?.find((f) => f.name === "kore_type");
  const koreLanguageFacet = facets?.find((f) => f.name === "kore_language");

  const hasActiveFilters = !!(
    keywords ||
    startYear ||
    endYear ||
    typeFilter ||
    languageFilter
  );

  const handleFacetSubmit = (
    value: string,
    urlKey: "type" | "language",
    announcement: string,
  ) => {
    submitFilters({ [urlKey]: value });
    setFilterAnnouncement(announcement);
  };

  const renderFacetSelect = ({
    facet,
    allOptions,
    wrapperClass,
    id,
    label,
    placeholder,
    value,
    onChange,
    onSubmit,
  }: {
    facet?: Facet;
    allOptions: ReadonlyArray<{ value: string; label: string }>;
    wrapperClass: string;
    id: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    onSubmit?: (value: string) => void;
  }) => {
    const options =
      allOptions.length > 0
        ? [...allOptions]
        : (facet?.values.map((v) => ({ value: v.filter, label: v.filter })) ??
          []);
    const optionsWithSelection =
      value && !options.some((o) => o.value === value)
        ? [{ value, label: value }, ...options]
        : options;

    return (
      <div className={wrapperClass}>
        <Select
          id={id}
          options={optionsWithSelection}
          value={value || undefined}
          clearable
          multiSelect={false}
          onChange={(selectedOptions) => {
            const selected = selectedOptions?.[0];
            const newValue = selected?.value ?? "";
            onChange(newValue);
            onSubmit?.(newValue);
          }}
          texts={{ label, language, placeholder }}
          disabled={loading}
        />
      </div>
    );
  };

  return (
    <div className="historia-search__form kore-search__form">
      <output className="visually-hidden" aria-live="polite" aria-atomic="true">
        {filterAnnouncement}
      </output>
      <form onSubmit={handleSubmit}>
        <div className="react-search-keyword">
          <SearchInput
            label={Drupal.t("Search", {}, { context: "Kore search" })}
            value={Array.isArray(keywords) ? keywords.join(" ") : keywords}
            onChange={(value) => handleInputChange(value, setKeywords, "q")}
            onSubmit={() => submitFilters()}
            placeholder={Drupal.t(
              "School name...",
              {},
              { context: "Kore search" },
            )}
            className="search-input"
            searchButtonAriaLabel={Drupal.t(
              "Search",
              {},
              { context: "Kore search" },
            )}
            clearButtonAriaLabel={Drupal.t(
              "Clear search",
              {},
              { context: "Kore search" },
            )}
          />
        </div>

        <h2 className="visually-hidden">
          {Drupal.t("Filter results", {}, { context: "Kore search" })}
        </h2>

        <div className="react-search-filters kore-search__filters">
          <div className="kore-search__filters-row">
            {renderFacetSelect({
              facet: koreTypeFacet,
              allOptions: typeOptions,
              wrapperClass: "filter-group filter-group--kore-type",
              id: "kore-type-select",
              label: Drupal.t("School type", {}, { context: "Kore search" }),
              placeholder: Drupal.t(
                "Select school type",
                {},
                { context: "Kore search" },
              ),
              value: typeFilter || "",
              onChange: (v) => setTypeFilter(v),
              onSubmit: (v) =>
                handleFacetSubmit(v, "type", searchingAnnouncement),
            })}

            {renderFacetSelect({
              facet: koreLanguageFacet,
              allOptions: languageOptions,
              wrapperClass: "filter-group filter-group--kore-language",
              id: "kore-language-select",
              label: Drupal.t("Language", {}, { context: "Kore search" }),
              placeholder: Drupal.t(
                "Select language",
                {},
                { context: "Kore search" },
              ),
              value: languageFilter || "",
              onChange: (v) => setLanguageFilter(v),
              onSubmit: (v) =>
                handleFacetSubmit(v, "language", searchingAnnouncement),
            })}
          </div>

          <div className="filter-group filter-group--dates kore-search__dates-row">
            <div className="date-filter-inputs">
              <YearRangeInput
                id="kore-start-year"
                label={Drupal.t("Beginning at", {}, { context: "Kore search" })}
                value={asString(startYear)}
                onChange={(v) =>
                  handleInputChange(v, setStartYear, "startYear")
                }
                onSliderRelease={() => {
                  submitFilters();
                  setFilterAnnouncement(searchingAnnouncement);
                }}
                placeholder={`${Drupal.t("e.g.", {}, { context: "Search" })} ${YEAR_MIN}`}
                clearButtonAriaLabel={Drupal.t(
                  "Clear beginning at",
                  {},
                  { context: "Kore search" },
                )}
                minYear={YEAR_MIN}
                maxYear={YEAR_MAX}
                disabled={loading}
              />
              <YearRangeInput
                id="kore-end-year"
                label={Drupal.t("Ending at", {}, { context: "Kore search" })}
                value={asString(endYear)}
                onChange={(v) => handleInputChange(v, setEndYear, "endYear")}
                onSliderRelease={() => {
                  submitFilters();
                  setFilterAnnouncement(searchingAnnouncement);
                }}
                placeholder={`${Drupal.t("e.g.", {}, { context: "Search" })} ${YEAR_MAX}`}
                clearButtonAriaLabel={Drupal.t(
                  "Clear ending at",
                  {},
                  { context: "Kore search" },
                )}
                minYear={YEAR_MIN}
                maxYear={YEAR_MAX}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="submit"
              disabled={loading}
              theme={ButtonPresetTheme.Black}
            >
              {loading
                ? Drupal.t("Searching...", {}, { context: "Kore search" })
                : Drupal.t("Search", {}, { context: "Kore search" })}
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                onClick={resetForm}
                variant={ButtonVariant.Supplementary}
                theme={ButtonPresetTheme.Black}
                iconStart={<IconCross />}
              >
                {Drupal.t("Clear", {}, { context: "Kore search" })}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default KoreSearchForm;

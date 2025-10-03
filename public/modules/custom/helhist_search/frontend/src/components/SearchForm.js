import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from 'hds-react/components/Button';
import { Koros } from 'hds-react/components/Koros';
import { SearchInput } from 'hds-react/components/SearchInput';
// import { fetchAutocompleteSuggestions } from '../helpers/autocomplete';
import { scrollTo } from '../helpers/scrollTo';
import EraSelector from './EraSelector';
import Facet from './Facet';

const SearchForm = ({
  searchKeywords,
  setSearchKeywords,
  facets,
  activeFacets,
  onFacetChange,
  selectedEra,
  setSelectedEra,
  resetSearch,
  searchHasFilters,
  resultsRef
}) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      "keywords": searchKeywords,
      "startYear": selectedEra.startYear,
      "endYear": selectedEra.endYear
    }
  });
  const [tmpKeywords, setTmpKeywords] = useState("");

  const onSubmit = suggestionKeyword => (formData) => {
    const { startYear, endYear } = formData;
    setSelectedEra({startYear: startYear, endYear: endYear})

    if (suggestionKeyword) {
      setSearchKeywords(suggestionKeyword);
    } else {
      setSearchKeywords(tmpKeywords);
    }

    scrollTo({
      ref: resultsRef,
      duration: 800
    })
  }

  const handleReset = () => {
    reset();
    resetSearch();
  }

  // @todo fix autocomplete suggestions via HIS-313
  // const getSuggestions = (inputValue) => new Promise((resolve) => {
  //   const suggestions = fetchAutocompleteSuggestions(inputValue);
  //   resolve(suggestions);
  // });

  const getSearchInputPlaceholder = () => {
    /**
     * Because there is no way to pass default value to the SearchInput-component,
     * we have to use search field's placeholder to show the pre-defined keyword.
     *
     * This should be refactored when following issue is resolved:
     * https://github.com/City-of-Helsinki/helsinki-design-system/issues/666
     */
    if (searchKeywords) {
      return searchKeywords;
    } else {
      return window.Drupal ? window.Drupal.t("Location, person, topic, event...", {}, {context: "Search"}) : "Location, person, topic, event...";
    }
  }

  return (
    <div className="search-filters">
      <div className="container block__container">
        <div className="filters">
          <form onSubmit={handleSubmit(onSubmit())}>
            <div className="form-item hds-text-input">
              <SearchInput
                label={window.Drupal ? window.Drupal.t("Search from content", {}, {context: "Search"}) : "Search from content"}
                placeholder={getSearchInputPlaceholder()}
                searchButtonAriaLabel={window.Drupal ? window.Drupal.t("Search", {}, {context: "Search"}) : "Search"}
                clearButtonAriaLabel="Clear search field"
                suggestionLabelField="value"
                // getSuggestions={getSuggestions} // @todo fix autocomplete suggestions via HIS-313
                onChange={(value) => setTmpKeywords(value)}
                onSubmit={(value) => handleSubmit(onSubmit(value))()}
              />
            </div>

            <div className="form-actions">
              <Button type="submit" className="form-submit">{window.Drupal ? window.Drupal.t("Search", {}, {context: "Search"}) : "Search"}</Button>
              {searchHasFilters && (
                <Button type="reset" className="form-reset" onClick={() => handleReset()}>{window.Drupal ? window.Drupal.t("Clear", {}, {context: "Search"}) : "Clear"}</Button>
              )}
            </div>

            <div className="form-label">
              {window.Drupal ? window.Drupal.t("Filter results", {}, {context: "Search"}) : "Filter results"}
            </div>

            <div className="form-item">
              <EraSelector
                register={register}
              />
            </div>

            {facets && facets.map(facet => (
              <div className="form-item" key={facet.name}>
                <Facet
                  name={facet.name}
                  values={facet.values.map(value => {return {label: value.filter}})}
                  selectedValues={activeFacets[facet.name]}
                  onFacetChange={onFacetChange}
                />
              </div>
            ))}
          </form>
        </div>
      </div>
      <Koros className="search-filters__koro" type="wave" flipHorizontal={true} style={{fill: "#333333", position: "absolute", bottom: "-70px"}} />
    </div>
  )
}

export default SearchForm;

import React from 'react';
import SortLink from './SortLink';

const SortLinks = ({ currentSort, onSortChange, sortOrderAscending }) => {
  return (
    <div className="search-header__sort-container">
      <div className="sort-label">
        {window.Drupal ? window.Drupal.t("Sort:", {}, {context: "Search"}) : "Sort"}
      </div>
      <ul className="sort-options">
        <SortLink
          title={window.Drupal ? window.Drupal.t("Relevance", {}, {context: "Search"}) : "Relevance"}
          active={currentSort === "relevance"}
          ascending={sortOrderAscending}
          ariaLabel={window.Drupal ? window.Drupal.t("Sort by relevance", {}, {context: "Search"}) : "Sort by relevance"}
          onPress={() => onSortChange("relevance")}
        />

        <SortLink
          title={window.Drupal ? window.Drupal.t("Year", {}, {context: "Search"}) : "Year"}
          active={currentSort === "year"}
          ascending={sortOrderAscending}
          ariaLabel={window.Drupal ? window.Drupal.t("Sort by year", {}, {context: "Search"}) : "Sort by year"}
          onPress={() => onSortChange("year")}
        />

        <SortLink
          title={window.Drupal ? window.Drupal.t("Created", {}, {context: "Search"}) : "Created"}
          active={currentSort === "created"}
          ascending={sortOrderAscending}
          ariaLabel={window.Drupal ? window.Drupal.t("Sort by creation date", {}, {context: "Search"}) : "Sort by creation date"}
          onPress={() => onSortChange("created")}
        />
      </ul>
    </div>
  )
}

export default SortLinks;
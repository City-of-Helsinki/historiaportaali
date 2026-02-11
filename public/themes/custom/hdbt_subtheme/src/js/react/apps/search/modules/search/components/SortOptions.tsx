import type React from "react";
import {
  IconArrowUp,
  IconArrowDown,
  IconCheck,
  Button,
  ButtonVariant,
  ButtonPresetTheme,
  ButtonSize,
} from "hds-react";
import { useAtomValue, useSetAtom } from "jotai";
import { urlAtom, urlUpdateAtom } from "../store";

export const SortOptions: React.FC = () => {
  const urlParams = useAtomValue(urlAtom);
  const setUrlParams = useSetAtom(urlUpdateAtom);
  const currentSort = urlParams.sort || "relevance";
  const currentSortOrder = urlParams.sort_order || "DESC";

  const handleSort = (sortType: "relevance" | "created" | "year") => {
    if (sortType === "relevance" && currentSort === "relevance") return;

    const { page, sort, sort_order, ...params } = urlParams;

    if (sortType === "relevance") {
      // Remove sort params for default relevancy sorting
      setUrlParams(params);
    } else {
      // Toggle between DESC and ASC for sortable fields
      const newOrder =
        currentSort === sortType && sort_order === "DESC" ? "ASC" : "DESC";
      setUrlParams({ ...params, sort: sortType, sort_order: newOrder });
    }
  };

  const getIcon = (sortType: "relevance" | "created" | "year") => {
    if (currentSort !== sortType) return undefined;
    if (sortType === "relevance") return <IconCheck aria-hidden="true" />;
    return currentSortOrder === "ASC" ? (
      <IconArrowUp aria-hidden="true" />
    ) : (
      <IconArrowDown aria-hidden="true" />
    );
  };

  const getActiveClass = (sortType: "relevance" | "created" | "year") => {
    return currentSort === sortType ? "active" : "";
  };

  const commonButtonProps = {
    size: ButtonSize.Small,
    variant: ButtonVariant.Supplementary,
    theme: ButtonPresetTheme.Black,
  };

  // Help screen readers to announce the sort options.
  const getAriaLabel = (sortType: "relevance" | "created" | "year") => {
    const fieldName =
      sortType === "year"
        ? Drupal.t("Year", {}, { context: "Search" })
        : Drupal.t("Created", {}, { context: "Search" });

    if (currentSort !== sortType) {
      // Inactive state: explain what clicking will do
      return `${Drupal.t("Sort by", {}, { context: "Search" })} ${fieldName}`;
    }

    // Active state: show current order and explain toggle action
    const currentOrder =
      currentSortOrder === "ASC"
        ? Drupal.t("oldest first", {}, { context: "Search" })
        : Drupal.t("newest first", {}, { context: "Search" });
    const nextOrder =
      currentSortOrder === "ASC"
        ? Drupal.t("newest first", {}, { context: "Search" })
        : Drupal.t("oldest first", {}, { context: "Search" });

    // Use string concatenation to avoid HTML in aria-label
    return `${Drupal.t("Sorted by", {}, { context: "Search" })} ${fieldName}, ${currentOrder}. ${Drupal.t("Click to show", {}, { context: "Search" })} ${nextOrder}`;
  };

  return (
    <>
      <span className="historia-search__results-actions-label">
        {Drupal.t("Sort search results", {}, { context: "Search" })}
      </span>
      <Button
        {...commonButtonProps}
        onClick={() => handleSort("relevance")}
        iconStart={getIcon("relevance")}
        className={getActiveClass("relevance")}
        aria-label={
          currentSort === "relevance"
            ? `${Drupal.t("Sorted by", {}, { context: "Search" })} ${Drupal.t("relevance", {}, { context: "Search" })}`
            : `${Drupal.t("Sort by", {}, { context: "Search" })} ${Drupal.t("relevance", {}, { context: "Search" })}`
        }
      >
        {Drupal.t("Relevance", {}, { context: "Search" })}
      </Button>
      <Button
        {...commonButtonProps}
        onClick={() => handleSort("year")}
        iconEnd={getIcon("year")}
        className={getActiveClass("year")}
        aria-label={getAriaLabel("year")}
      >
        {Drupal.t("Year", {}, { context: "Search" })}
      </Button>
      <Button
        {...commonButtonProps}
        onClick={() => handleSort("created")}
        iconEnd={getIcon("created")}
        className={getActiveClass("created")}
        aria-label={getAriaLabel("created")}
      >
        {Drupal.t("Created", {}, { context: "Search" })}
      </Button>
    </>
  );
};

export default SortOptions;

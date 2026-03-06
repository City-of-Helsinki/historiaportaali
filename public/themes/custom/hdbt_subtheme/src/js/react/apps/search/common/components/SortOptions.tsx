import type React from "react";
import type { Atom, WritableAtom } from "jotai";
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

export type SortOption = "relevance" | "title" | "name" | "year" | "created";

type URLParams = Record<string, string | string[] | undefined> & {
  sort?: string;
  sort_order?: string;
};

interface SortOptionsProps {
  urlAtom: Atom<URLParams>;
  urlUpdateAtom: WritableAtom<null, [URLParams], void>;
  options: SortOption[];
  context?: string;
}

export const SortOptions: React.FC<SortOptionsProps> = ({
  urlAtom,
  urlUpdateAtom,
  options,
  context = "Search",
}) => {
  const urlParams = useAtomValue(urlAtom);
  const setUrlParams = useSetAtom(urlUpdateAtom);
  const currentSort = urlParams.sort || "relevance";
  const currentSortOrder = urlParams.sort_order || "DESC";

  const handleSort = (sortType: SortOption) => {
    if (sortType === "relevance" && currentSort === "relevance") return;

    const { page, sort, sort_order, ...params } = urlParams;

    if (sortType === "relevance") {
      setUrlParams(params as URLParams);
    } else {
      const newOrder =
        currentSort === sortType && currentSortOrder === "DESC"
          ? "ASC"
          : "DESC";
      setUrlParams({
        ...params,
        sort: sortType,
        sort_order: newOrder,
      } as URLParams);
    }
  };

  const getIcon = (sortType: SortOption) => {
    if (currentSort !== sortType) return undefined;
    if (sortType === "relevance") return <IconCheck aria-hidden="true" />;
    return currentSortOrder === "ASC" ? (
      <IconArrowUp aria-hidden="true" />
    ) : (
      <IconArrowDown aria-hidden="true" />
    );
  };

  const getActiveClass = (sortType: SortOption) =>
    currentSort === sortType ? "active" : "";

  const commonButtonProps = {
    size: ButtonSize.Small,
    variant: ButtonVariant.Supplementary,
    theme: ButtonPresetTheme.Black,
  };

  const getLabelForSortType = (sortType: SortOption): string => {
    const customLabel = drupalSettings?.koreSearch?.sortLabels?.[sortType];
    if (customLabel) return customLabel;

    const defaults: Record<SortOption, string> = {
      year: "Year",
      title: "Title",
      name: "Name",
      created: "Created",
      relevance: "Relevance",
    };
    return Drupal.t(defaults[sortType] ?? sortType, {}, { context });
  };

  const getAriaLabel = (sortType: SortOption) => {
    const fieldName = getLabelForSortType(sortType);

    if (currentSort !== sortType) {
      return `${Drupal.t("Sort by", {}, { context })} ${fieldName}`;
    }

    const currentOrder =
      currentSortOrder === "ASC"
        ? Drupal.t("oldest first", {}, { context })
        : Drupal.t("newest first", {}, { context });
    const nextOrder =
      currentSortOrder === "ASC"
        ? Drupal.t("newest first", {}, { context })
        : Drupal.t("oldest first", {}, { context });

    return `${Drupal.t("Sorted by", {}, { context })} ${fieldName}, ${currentOrder}. ${Drupal.t("Click to show", {}, { context })} ${nextOrder}`;
  };

  const getLabel = (sortType: SortOption) => {
    if (sortType === "relevance") {
      return Drupal.t("Relevance", {}, { context });
    }
    return getLabelForSortType(sortType);
  };

  return (
    <>
      <span className="historia-search__results-actions-label">
        {Drupal.t("Sort search results", {}, { context })}
      </span>
      {options.map((sortType) => (
        <Button
          key={sortType}
          {...commonButtonProps}
          onClick={() => handleSort(sortType)}
          iconStart={sortType === "relevance" ? getIcon(sortType) : undefined}
          iconEnd={sortType !== "relevance" ? getIcon(sortType) : undefined}
          className={getActiveClass(sortType)}
          aria-label={
            sortType === "relevance"
              ? currentSort === "relevance"
                ? `${Drupal.t("Sorted by", {}, { context })} ${Drupal.t("relevance", {}, { context })}`
                : `${Drupal.t("Sort by", {}, { context })} ${Drupal.t("relevance", {}, { context })}`
              : getAriaLabel(sortType)
          }
        >
          {getLabel(sortType)}
        </Button>
      ))}
    </>
  );
};

export default SortOptions;

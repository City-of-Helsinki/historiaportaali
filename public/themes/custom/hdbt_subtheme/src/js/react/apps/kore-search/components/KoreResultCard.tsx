import type React from "react";
import type { KoreItem } from "../types/Content";
import CardItem from "@/react/common/Card";
import Tags from "@/react/common/Tags";

const valueToLabelMap = (
  opts: Array<{ value: string; label: string }> | undefined,
): Map<string, string> => new Map(opts?.map((o) => [o.value, o.label]) ?? []);

const formatYearRange = (start: number | null, end: number | null): string => {
  if (start !== null && end !== null) {
    return start === end ? `${start}` : `${start} → ${end}`;
  }
  if (start !== null) return `${start}`;
  if (end !== null) return `${end}`;
  return "";
};

interface KoreResultCardProps extends KoreItem {}

export const KoreResultCard: React.FC<KoreResultCardProps> = ({
  title,
  kore_name_entries,
  kore_type,
  url,
  nid,
}) => {
  const typeLabels = valueToLabelMap(drupalSettings?.koreSearch?.typeOptions);
  const entries = (kore_name_entries ?? []).map((e) => ({
    name: e.name,
    years: formatYearRange(e.start_year, e.end_year),
  }));
  const displayName = entries[0]?.name || title || "Untitled";
  const cardTitle = entries[0]?.years ? (
    <>
      {displayName}
      <span className="kore-result-card__years-inline">
        {" "}
        {entries[0].years}
      </span>
    </>
  ) : (
    displayName
  );
  const cardTags =
    (kore_type?.length ?? 0) > 0
      ? (kore_type ?? []).map((type) => ({
          tag: typeLabels.get(type) ?? type,
        }))
      : undefined;
  const customMetaRows: JSX.Element[] = [];
  if (cardTags?.length) {
    customMetaRows.push(
      <div key="types" className="kore-result-card__types">
        <Tags tags={cardTags} insideCard />
      </div>,
    );
  }
  if (entries.length > 1) {
    customMetaRows.push(
      <section
        key="names"
        className="kore-result-card__names"
        aria-labelledby={nid ? `kore-names-${nid}` : undefined}
      >
        <h4
          id={nid ? `kore-names-${nid}` : undefined}
          className="kore-result-card__names-title"
        >
          {Drupal.t("Previous names", {}, { context: "Kore search" })}
        </h4>
        <ul className="kore-result-card__names-list">
          {entries.slice(1).map(({ name, years }) => (
            <li key={`${name}-${years}`}>
              <span className="kore-result-card__name">{name}</span>
              {years && (
                <span className="kore-result-card__years"> {years}</span>
              )}
            </li>
          ))}
        </ul>
      </section>,
    );
  }

  return (
    <CardItem
      cardTitle={cardTitle}
      cardUrl={url}
      cardTitleLevel={3}
      cardModifierClass="card--border kore-result-card"
      customMetaRows={
        customMetaRows.length > 0 ? { top: customMetaRows } : undefined
      }
    />
  );
};

export default KoreResultCard;

import type React from "react";
import type { KoreItem } from "../types/Content";

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
  kore_language,
  url,
}) => {
  const typeLabels = valueToLabelMap(drupalSettings?.koreSearch?.typeOptions);
  const languageLabels = valueToLabelMap(
    drupalSettings?.koreSearch?.languageOptions,
  );
  const displayType = (v: string) => typeLabels.get(v) ?? v;
  const displayLanguage = (v: string) => languageLabels.get(v) ?? v;

  const entries = (kore_name_entries ?? []).map((e) => ({
    name: e.name,
    years: formatYearRange(e.start_year, e.end_year),
  }));

  const displayName = entries[0]?.name || title || "Untitled";

  return (
    <div className="card card--border">
      <div className="card__text">
        <h3 className="card__title">
          <a href={url} className="card__link" rel="bookmark">
            {displayName}
          </a>
          {entries[0]?.years && (
            <span className="kore-result-card__title-years">
              {" "}
              {entries[0].years}
            </span>
          )}
        </h3>
        {(kore_type?.length || kore_language?.length) && (
          <div>
            {kore_type?.length ? (
              <div>
                {Drupal.t("School type", {}, { context: "Kore search" })}:{" "}
                {kore_type.map(displayType).join(", ")}
              </div>
            ) : null}
            {kore_language?.length ? (
              <div>
                {Drupal.t("Language", {}, { context: "Kore search" })}:{" "}
                {kore_language.map(displayLanguage).join(", ")}
              </div>
            ) : null}
          </div>
        )}
        {entries.length > 1 && (
          <div className="kore-result-card__names">
            <h4 className="kore-result-card__names-title">
              {Drupal.t("Previous names", {}, { context: "Kore search" })}
            </h4>
            {entries.slice(1).map(({ name, years }) => (
              <div
                key={`${name}-${years}`}
                className="kore-result-card__name-entry"
              >
                <span className="kore-result-card__name">{name}</span>
                {years ? (
                  <>
                    {" "}
                    <span className="kore-result-card__years">{years}</span>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KoreResultCard;

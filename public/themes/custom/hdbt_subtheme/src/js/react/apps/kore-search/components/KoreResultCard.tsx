import type React from "react";
import type { KoreItem } from "../types/Content";

const valueToLabelMap = (
  opts: Array<{ value: string; label: string }> | undefined,
): Map<string, string> => new Map(opts?.map((o) => [o.value, o.label]) ?? []);

interface KoreResultCardProps extends KoreItem {}

export const KoreResultCard: React.FC<KoreResultCardProps> = ({
  title,
  kore_names,
  kore_type,
  kore_language,
  start_year,
  end_year,
  url,
}) => {
  const typeLabels = valueToLabelMap(drupalSettings?.koreSearch?.typeOptions);
  const languageLabels = valueToLabelMap(
    drupalSettings?.koreSearch?.languageOptions,
  );
  const displayType = (v: string) => typeLabels.get(v) ?? v;
  const displayLanguage = (v: string) => languageLabels.get(v) ?? v;

  const displayName = kore_names?.[0] || title || "Untitled";
  const yearDisplay =
    start_year && end_year
      ? start_year === end_year
        ? `${start_year}`
        : `${start_year} – ${end_year}`
      : start_year
        ? `${start_year}`
        : end_year
          ? `${end_year}`
          : null;

  return (
    <div className="card card--border">
      <div className="card__text">
        <h3 className="card__title">
          <a href={url} className="card__link" rel="bookmark">
            {displayName}
          </a>
        </h3>
        {(kore_type?.length || kore_language?.length || yearDisplay) && (
          <div className="card__metas">
            {kore_type?.length ? (
              <span className="card__meta">
                {kore_type.map(displayType).join(", ")}
              </span>
            ) : null}
            {kore_language?.length ? (
              <span className="card__meta">
                {kore_language.map(displayLanguage).join(", ")}
              </span>
            ) : null}
            {yearDisplay ? (
              <span className="card__meta">{yearDisplay}</span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default KoreResultCard;

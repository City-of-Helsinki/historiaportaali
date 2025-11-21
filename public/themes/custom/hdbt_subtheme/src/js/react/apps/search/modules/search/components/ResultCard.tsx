import React from 'react';
import { ContentItem } from '../../../common/types/Content';
import CardItem, { Metarow } from '@/react/common/Card';
import { t } from '../../../common/utils/translate';

interface ResultCardProps extends ContentItem {}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  image_url,
  formats,
  phenomena,
  neighbourhoods,
  start_year,
  end_year,
  url,
}) => {
  const cardImage = image_url ? (
    <img 
      src={image_url} 
      alt=""
      loading="lazy"
    />
  ) : undefined;

  // Build custom metadata rows with icons
  const customMetaRows: JSX.Element[] = [];

  // Format/Bundle type
  if (formats && formats.length > 0) {
    customMetaRows.push(
      <Metarow
        key="format"
        icon="photo"
        label={t('Format', {}, { context: 'Seearch' })}
        content={formats.join(', ')}
      />
    );
  }

  // Year
  if (start_year && end_year) {
    const yearDisplay = start_year === end_year 
      ? `${start_year}`
      : `${start_year} - ${end_year}`;
    customMetaRows.push(
      <Metarow
        key="year"
        icon="clock"
        label={t('Year')}
        content={yearDisplay}
      />
    );
  }

  // Phenomena
  if (phenomena && phenomena.length > 0) {
    customMetaRows.push(
      <Metarow
        key="phenomena"
        icon="layers"
        label={t('Phenomena', {}, { context: 'Search' })}
        content={phenomena.join(', ')}
      />
    );
  }

  // Neighbourhoods
  if (neighbourhoods && neighbourhoods.length > 0) {
    customMetaRows.push(
      <Metarow
        key="neighbourhoods"
        icon="location"
        label={t('Region', {}, { context: 'Search' })}
        content={neighbourhoods.join(', ')}
      />
    );
  }

  return (
    <CardItem
      cardTitle={title}
      cardUrl={url}
      cardImage={cardImage}
      cardTitleLevel={3}
      cardModifierClass="card--border"
      customMetaRows={{ top: customMetaRows }}
    />
  );
};

export default ResultCard;


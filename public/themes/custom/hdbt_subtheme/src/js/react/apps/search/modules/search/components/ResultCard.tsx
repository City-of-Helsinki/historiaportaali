import React from 'react';
import { ContentItem } from '../../../common/types/Content';
import CardItem from '@/react/common/Card';

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
  // Build metadata display for description
  const metadataParts: string[] = [];
  
  if (start_year && end_year) {
    const yearDisplay = start_year === end_year 
      ? `${start_year}`
      : `${start_year} - ${end_year}`;
    metadataParts.push(yearDisplay);
  }
  
  if (formats && formats.length > 0) {
    metadataParts.push(formats.join(', '));
  }
  
  if (phenomena && phenomena.length > 0) {
    metadataParts.push(phenomena.join(', '));
  }
  
  if (neighbourhoods && neighbourhoods.length > 0) {
    metadataParts.push(neighbourhoods.join(', '));
  }

  const cardImage = image_url ? (
    <img 
      src={image_url} 
      alt={title} 
      loading="lazy"
    />
  ) : undefined;

  return (
    <CardItem
      cardTitle={title}
      cardUrl={url}
      cardImage={cardImage}
      cardDescription={metadataParts.join(' • ')}
      cardTitleLevel={3}
    />
  );
};

export default ResultCard;


import React from 'react';
import { IconArrowUp, IconArrowDown, IconCheck, Button, ButtonVariant, ButtonPresetTheme, ButtonSize } from 'hds-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { urlAtom, urlUpdateAtom } from '../store';
import { t } from '../../../common/utils/translate';

export const SortOptions: React.FC = () => {
  const urlParams = useAtomValue(urlAtom);
  const setUrlParams = useSetAtom(urlUpdateAtom);
  const currentSort = urlParams.sort || 'relevance';
  const currentSortOrder = urlParams.sort_order || 'DESC';

  const handleSort = (sortType: 'relevance' | 'created' | 'year') => {
    if (sortType === 'relevance' && currentSort === 'relevance') return;
    
    const { page, sort, sort_order, ...params } = urlParams;
    
    if (sortType === 'relevance') {
      // Remove sort params for default relevancy sorting
      setUrlParams(params);
    } else {
      // Toggle between DESC and ASC for sortable fields
      const newOrder = currentSort === sortType && sort_order === 'DESC' ? 'ASC' : 'DESC';
      setUrlParams({ ...params, sort: sortType, sort_order: newOrder });
    }
  };

  const getIcon = (sortType: 'relevance' | 'created' | 'year') => {
    if (currentSort !== sortType) return undefined;
    if (sortType === 'relevance') return <IconCheck aria-hidden="true" />;
    return currentSortOrder === 'ASC' 
      ? <IconArrowUp aria-hidden="true" /> 
      : <IconArrowDown aria-hidden="true" />;
  };

  const getActiveClass = (sortType: 'relevance' | 'created' | 'year') => {
    return currentSort === sortType ? 'active' : '';
  };

  const commonButtonProps = {
    size: ButtonSize.Small,
    variant: ButtonVariant.Supplementary,
    theme: ButtonPresetTheme.Black,
  };

  // Help screen readers to announce the sort options.
  const getAriaLabel = (sortType: 'relevance' | 'created' | 'year') => {
    const fieldName = sortType === 'year' 
      ? t('Year', {}, { context: 'Search' })
      : t('Created', {}, { context: 'Search' });
    
    if (currentSort !== sortType) {
      // Inactive state: explain what clicking will do
      return `${t('Sort by', {}, { context: 'Search' })} ${fieldName}`;
    }
    
    // Active state: show current order and explain toggle action
    const currentOrder = currentSortOrder === 'ASC' 
      ? t('oldest first', {}, { context: 'Search' })
      : t('newest first', {}, { context: 'Search' });
    const nextOrder = currentSortOrder === 'ASC'
      ? t('newest first', {}, { context: 'Search' })
      : t('oldest first', {}, { context: 'Search' });
    
    // Use string concatenation to avoid HTML in aria-label
    return `${t('Sorted by', {}, { context: 'Search' })} ${fieldName}, ${currentOrder}. ${t('Click to show', {}, { context: 'Search' })} ${nextOrder}`;
  };

  return (
    <>
      <span className="historia-search__results-actions-label">{t('Sort search results', {}, { context: 'Search' })}:</span>
      <Button
        {...commonButtonProps}
        onClick={() => handleSort('relevance')}
        iconStart={getIcon('relevance')}
        className={getActiveClass('relevance')}
        aria-label={currentSort === 'relevance' 
          ? `${t('Sorted by', {}, { context: 'Search' })} ${t('relevance', {}, { context: 'Search' })}`
          : `${t('Sort by', {}, { context: 'Search' })} ${t('relevance', {}, { context: 'Search' })}`
        }
      >
        {t('Relevance', {}, { context: 'Search' })}
      </Button>
      <Button
        {...commonButtonProps}
        onClick={() => handleSort('year')}
        iconEnd={getIcon('year')}
        className={getActiveClass('year')}
        aria-label={getAriaLabel('year')}
      >
        {t('Year', {}, { context: 'Search' })}
      </Button>
      <Button
        {...commonButtonProps}
        onClick={() => handleSort('created')}
        iconEnd={getIcon('created')}
        className={getActiveClass('created')}
        aria-label={getAriaLabel('created')}
      >
        {t('Created', {}, { context: 'Search' })}
      </Button>
    </>
  );
};

export default SortOptions;


import React from 'react';
import { Select } from 'hds-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { urlAtom, urlUpdateAtom } from '../store';
import { t } from '../../../common/utils/translate';

export const SortDropdown: React.FC = () => {
  const urlParams = useAtomValue(urlAtom);
  const setUrlParams = useSetAtom(urlUpdateAtom);
  const language = drupalSettings?.path?.currentLanguage || 'fi';

  const sortOptions = [
    { value: 'relevance', label: t('Relevance', {}, { context: 'Search' }) },
    { value: 'newest', label: t('Newest first', {}, { context: 'Search' }) },
    { value: 'oldest', label: t('Oldest first', {}, { context: 'Search' }) },
  ];

  const handleSortChange = (selected: any) => {
    const value = selected[0]?.value;
    if (!value) return;
    // Preserve all current URL params, just update sort and reset page
    const newParams = { ...urlParams, sort: value };
    delete newParams.page; // Reset to page 1
    setUrlParams(newParams);
  };

  const currentValue = urlParams.sort || 'relevance';

  return (
    <Select
      id="sort-select"
      options={sortOptions}
      value={currentValue}
      onChange={handleSortChange}
      texts={{
        label: t('Sort search results', {}, { context: 'Search' }),
        language: language,
      }}
    />
  );
};

export default SortDropdown;

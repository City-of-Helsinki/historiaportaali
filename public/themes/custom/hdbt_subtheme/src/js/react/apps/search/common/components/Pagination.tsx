import React from 'react';
import { Pagination as HDSPagination } from 'hds-react';

type PaginationProps = {
  updatePage: (e: React.MouseEvent, pageIndex: number) => void; // 0-based index
  currentPage: number; // 0-based index
  pages: number;
  totalPages: number;
};

const language = drupalSettings?.path?.currentLanguage || 'en';

export const Pagination = ({ updatePage, currentPage, totalPages }: PaginationProps) => {
  const handlePageChange = (event: React.MouseEvent<HTMLElement>, pageIndex: number) => {
    event.preventDefault();
    updatePage(event, pageIndex); // Pass 0-based index directly
  };

  return (
    <div className='historia-search__pagination'>
      <HDSPagination
        language={language}
        onChange={handlePageChange}
        pageCount={totalPages}
        pageHref={(pageIndex) => `?page=${pageIndex + 1}`} // Convert 0-based index to 1-based for URL
        pageIndex={currentPage}                            // Already 0-based, pass directly
        paginationAriaLabel="Pagination"
        siblingCount={2}
        hideNextButton={false}
        hidePrevButton={false}
      />
    </div>
  );
};

export default Pagination;


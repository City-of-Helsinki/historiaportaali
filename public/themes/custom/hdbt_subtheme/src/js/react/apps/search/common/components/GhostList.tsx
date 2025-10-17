import React from 'react';

interface GhostListProps {
  count: number;
}

export const GhostList: React.FC<GhostListProps> = ({ count }) => {
  return (
    <div className="search-loading">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="search-loading__item">
          <div className="search-loading__image"></div>
          <div className="search-loading__content">
            <div className="search-loading__title"></div>
            <div className="search-loading__text"></div>
            <div className="search-loading__text"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

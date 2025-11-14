import React from 'react';
import { t } from '../utils/translate';

interface ResultsEmptyProps {
  title?: string;
  content?: string;
  wrapperClass?: string;
}

export const ResultsEmpty: React.FC<ResultsEmptyProps> = ({ 
  title, 
  content, 
  wrapperClass = "historia-search__results--empty" 
}) => {
  return (
    <div className={wrapperClass}>
      <h3>{title || t("No results", {}, {context: "Search"})}</h3>
      <p>{content || t("No results were found for the criteria you entered. Try changing your search criteria.", {}, { context: "Search" })}</p>
    </div>
  );
};

export default ResultsEmpty;


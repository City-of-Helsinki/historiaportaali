import React from 'react';
import { t } from '../utils/translate';

const ResultsError: React.FC = () => {
  return (
    <div className="search-error">
      <h3>{t("Search is not working at the moment", {}, {context: "Search"})}</h3>
      <p>{t("Try again later or contact support.", {}, {context: "Search"})}</p>
    </div>
  );
};

export default ResultsError;

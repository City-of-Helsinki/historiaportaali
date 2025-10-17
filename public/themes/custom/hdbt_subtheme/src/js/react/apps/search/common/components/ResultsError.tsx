import React from 'react';

const ResultsError: React.FC = () => {
  return (
    <div className="search-error">
      <h3>{window.Drupal?.t("Search is not working at the moment", {}, {context: "Search"}) || "Search is not working at the moment"}</h3>
      <p>{window.Drupal?.t("Try again later or contact support.", {}, {context: "Search"}) || "Try again later or contact support."}</p>
    </div>
  );
};

export default ResultsError;

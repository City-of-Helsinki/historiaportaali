import React from 'react';
import { Notification } from 'hds-react';

interface ResultsErrorProps {
  error?: Error | string;
  className?: string;
}

const ResultsError: React.FC<ResultsErrorProps> = ({ className }) => {
  return (
    <div className={className || "search-error"}>
      <Notification
        label={Drupal.t("An error occurred while loading the content", {}, { context: "Search" })}
        type='error'
      >
        {Drupal.t("Please reload the page or try again later.", {}, {context: "Search"})}
      </Notification>
    </div>
  );
};

export default ResultsError;

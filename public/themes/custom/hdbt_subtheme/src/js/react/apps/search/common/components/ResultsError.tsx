import React from 'react';
import { Notification } from 'hds-react';
import { t } from '../utils/translate';

interface ResultsErrorProps {
  error?: Error | string;
  className?: string;
}

const ResultsError: React.FC<ResultsErrorProps> = ({ className }) => {
  return (
    <div className={className || "search-error"}>
      <Notification
        label={t("An error occurred while loading the content", {}, { context: "Search" })}
        type='error'
      >
        {t("Please reload the page or try again later.", {}, {context: "Search"})}
      </Notification>
    </div>
  );
};

export default ResultsError;

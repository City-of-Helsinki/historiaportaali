import React from 'react';
import { LoadingSpinner } from 'hds-react';

export const LoadingState: React.FC = () => {
  return (
    <div className="hdbt__loading-overlay">
      <LoadingSpinner multicolor />
    </div>
  );
};

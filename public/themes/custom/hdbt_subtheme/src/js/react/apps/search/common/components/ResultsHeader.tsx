import { ForwardedRef, forwardRef, ReactElement } from 'react';

type ResultsHeaderProps = {
  resultText: ReactElement | string;
  optionalResultsText?: ReactElement | string;
  actions?: ReactElement;
  actionsClass?: string;
}

const ResultsHeader = forwardRef(({ resultText, optionalResultsText, actions, actionsClass }: ResultsHeaderProps, ref: ForwardedRef<HTMLHeadingElement>) => (
  <div className='historia-search__result-top-area'>
    <h3 className='historia-search__results--title' ref={ref}>
      {resultText} {optionalResultsText && (<>({optionalResultsText})</> )}
    </h3>
    {actions && (
      <div className={actionsClass}>
        {actions}
      </div>
    )}
  </div>
));

ResultsHeader.displayName = 'ResultsHeader';

export default ResultsHeader;


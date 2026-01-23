declare global {
  const Drupal: {
    t: (text: string, args?: Record<string, any>, options?: {context?: string}) => string;
    formatPlural: (count: number, singular: string, plural: string, args?: Record<string, any>, options?: {context?: string}) => string;
  };

  const drupalSettings: {
    path: {
      currentLanguage: 'fi' | 'en' | 'sv';
    };
    search?: {
      mappingMode?: 'text' | 'keyword';
    };
  };
}

export {};

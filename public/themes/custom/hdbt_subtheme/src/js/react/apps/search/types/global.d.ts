declare global {
  interface Window {
    Drupal?: {
      t: (text: string, args?: Record<string, any>, options?: {context?: string}) => string;
    };
  }

  const drupalSettings: {
    path: {
      currentLanguage: 'fi' | 'en' | 'sv';
    };
  };
}

export {};

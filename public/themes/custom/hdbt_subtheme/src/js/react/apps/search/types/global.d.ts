declare global {
  const Drupal: {
    t: (
      text: string,
      args?: Record<string, unknown>,
      options?: { context?: string },
    ) => string;
    formatPlural: (
      count: number,
      singular: string,
      plural: string,
      args?: Record<string, unknown>,
      options?: { context?: string },
    ) => string;
  };

  const drupalSettings: {
    path: {
      currentLanguage: "fi" | "en" | "sv";
    };
    search?: {
      mappingMode?: "text" | "keyword";
    };
    koreSearch?: {
      typeOptions?: Array<{ value: string; label: string }>;
      languageOptions?: Array<{ value: string; label: string }>;
    };
  };
}

export {};

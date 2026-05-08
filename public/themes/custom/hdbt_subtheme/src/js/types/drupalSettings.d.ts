declare namespace drupalSettings {
  const koreSearch: {
    typeOptions: Array<{ value: string; label: string }>;
    languageOptions: Array<{ value: string; label: string }>;
    mappingMode: 'text' | 'keyword';
    sortLabels: Record<string, string>;
  };
  const search: {
    mappingMode: 'text' | 'keyword';
  };
}

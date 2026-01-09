<?php

declare(strict_types=1);

namespace Drupal\helhist_search;

/**
 * Generates search page links with filter or keyword parameters.
 */
class SearchLinkGenerator {

  /**
   * Map Drupal field names to their corresponding search filter parameter.
   */
  protected const FILTER_FIELD_MAPPING = [
    'field_phenomena' => 'phenomena',
    'field_neighbourhoods' => 'neighbourhoods',
    'field_formats' => 'formats',
  ];

  /**
   * The search path resolver.
   */
  protected SearchPathResolver $searchPathResolver;

  /**
   * Constructs a SearchLinkGenerator object.
   */
  public function __construct(SearchPathResolver $search_path_resolver) {
    $this->searchPathResolver = $search_path_resolver;
  }

  /**
   * Generates a search URL for a given field and term value.
   *
   * Filter fields use filter parameter (?phenomena=X).
   * Other fields use keyword search (?q=X).
   *
   * @param string $field_name
   *   The Drupal field name.
   * @param string $value
   *   The term value to search for.
   *
   * @return string
   *   The search URL with appropriate query parameters.
   */
  public function generateSearchUrl(string $field_name, string $value): string {
    $base_path = $this->searchPathResolver->getSearchPagePath();
    $filter_key = self::FILTER_FIELD_MAPPING[$field_name] ?? NULL;

    if ($filter_key) {
      return $base_path . '?' . $filter_key . '=' . rawurlencode($value);
    }

    return $base_path . '?q=' . rawurlencode($value);
  }

}

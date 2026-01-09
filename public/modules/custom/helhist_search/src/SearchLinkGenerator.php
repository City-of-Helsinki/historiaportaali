<?php

declare(strict_types=1);

namespace Drupal\helhist_search;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;

/**
 * Generates search page links with filter or keyword parameters.
 */
class SearchLinkGenerator {

  use StringTranslationTrait;

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
  public function __construct(
    SearchPathResolver $search_path_resolver,
    TranslationInterface $string_translation,
  ) {
    $this->searchPathResolver = $search_path_resolver;
    $this->stringTranslation = $string_translation;
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

  /**
   * Generates a search URL for year/period filtering.
   *
   * @param int|string|null $start_year
   *   The start year (can be negative for BCE).
   * @param int|string|null $end_year
   *   The end year (can be negative for BCE), or NULL for single year search.
   *
   * @return string
   *   The search URL with year filter parameters.
   */
  public function generateYearSearchUrl(int|string|null $start_year, int|string|null $end_year = NULL): string {
    $base_path = $this->searchPathResolver->getSearchPagePath();

    if ($start_year === NULL) {
      return $base_path;
    }

    $start_year = (int) $start_year;

    // If end year is not provided, use start year for exact match.
    $end_year = (int) ($end_year ?? $start_year);

    return $base_path . '?startYear=' . $start_year . '&endYear=' . $end_year;
  }

  /**
   * Formats a year for display, adding BCE suffix for negative years.
   *
   * @param int|string $year
   *   The year value (negative for BCE).
   *
   * @return string
   *   Formatted year (e.g., "1992" or "500 BCE").
   */
  protected function formatYear(int|string $year): string {
    $year = (int) $year;

    if ($year > 0) {
      return (string) $year;
    }

    return abs($year) . ' ' . $this->t('BCE');
  }

  /**
   * Formats a time period for display.
   *
   * @param int|string|null $start_year
   *   The start year (can be negative for BCE).
   * @param int|string|null $end_year
   *   The end year (can be negative for BCE), or NULL for single year.
   *
   * @return string
   *   Formatted period (e.g., "1992", "500 BCE", or "1992 – 1999").
   */
  public function formatPeriod(int|string|null $start_year, int|string|null $end_year = NULL): string {
    if ($start_year === NULL) {
      return '';
    }

    // Default end year to start year if not provided.
    $end_year = (int) ($end_year ?? $start_year);
    $start_year = (int) $start_year;

    if ($end_year === $start_year) {
      return $this->formatYear($start_year);
    }

    return $this->formatYear($start_year) . ' – ' . $this->formatYear($end_year);
  }

}

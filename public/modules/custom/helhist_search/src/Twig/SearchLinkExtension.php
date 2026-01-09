<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Twig;

use Drupal\helhist_search\SearchLinkGenerator;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

/**
 * Twig extension for generating search links and formatting periods.
 *
 * Usage:
 *   {{ search_url('field_phenomena', 'Term Name') }}
 *   {{ search_year_url(1992) }}
 *   {{ search_year_url(1992, 1999) }}
 *   {{ format_period(1992) }}
 *   {{ format_period(1992, 1999) }}
 *   {{ format_period(-500) }} -> "500 BCE"
 */
class SearchLinkExtension extends AbstractExtension {

  /**
   * The search link generator.
   */
  protected SearchLinkGenerator $searchLinkGenerator;

  /**
   * Constructs a SearchLinkExtension object.
   */
  public function __construct(SearchLinkGenerator $search_link_generator) {
    $this->searchLinkGenerator = $search_link_generator;
  }

  /**
   * {@inheritdoc}
   */
  public function getFunctions(): array {
    return [
      new TwigFunction('search_url', [$this->searchLinkGenerator, 'generateSearchUrl']),
      new TwigFunction('search_year_url', [$this->searchLinkGenerator, 'generateYearSearchUrl']),
      new TwigFunction('format_period', [$this->searchLinkGenerator, 'formatPeriod']),
    ];
  }

}

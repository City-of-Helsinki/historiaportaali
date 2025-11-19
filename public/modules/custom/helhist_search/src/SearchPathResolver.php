<?php

declare(strict_types=1);

namespace Drupal\helhist_search;

use Drupal\Core\Url;

/**
 * Resolves search page paths based on language.
 */
class SearchPathResolver {

  /**
   * The node ID of the main search page.
   */
  const SEARCH_PAGE_NODE_ID = 114;

  /**
   * Get the search page path.
   *
   * @return string
   *   The search page path.
   */
  public function getSearchPagePath(): string {
    $url = Url::fromRoute('entity.node.canonical', ['node' => self::SEARCH_PAGE_NODE_ID]);
    return $url->toString();
  }

}

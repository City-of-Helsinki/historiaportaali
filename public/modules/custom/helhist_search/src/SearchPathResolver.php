<?php

declare(strict_types=1);

namespace Drupal\helhist_search;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Url;

/**
 * Resolves search page paths based on language.
 */
class SearchPathResolver {

  /**
   * The config factory.
   */
  protected ConfigFactoryInterface $configFactory;

  /**
   * Constructs a SearchPathResolver object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   */
  public function __construct(ConfigFactoryInterface $config_factory) {
    $this->configFactory = $config_factory;
  }

  /**
   * Get the search page node ID.
   *
   * @return int|null
   *   The search page node ID or NULL if not configured.
   */
  public function getSearchPageNodeId(): ?int {
    $node_id = $this->configFactory->get('helhist_search.settings')->get('search_page_node');
    return $node_id ? (int) $node_id : NULL;
  }

  /**
   * Get the search page path.
   *
   * @return string
   *   The search page path or '/' if not configured.
   */
  public function getSearchPagePath(): string {
    $node_id = $this->getSearchPageNodeId();

    if (!$node_id) {
      return '/';
    }

    $url = Url::fromRoute('entity.node.canonical', ['node' => $node_id]);
    return $url->toString();
  }

}

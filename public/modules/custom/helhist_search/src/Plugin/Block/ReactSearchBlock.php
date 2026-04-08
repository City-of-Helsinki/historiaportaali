<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\Attribute\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\helhist_search\SearchPathResolver;
use Drupal\node\NodeInterface;

/**
 * Provides a React Search block.
 *
 * @phpstan-consistent-constructor
 */
#[Block(
  id: 'helhist_search_react_search_block',
  admin_label: new TranslatableMarkup('HelHist React Search'),
  category: new TranslatableMarkup('HelHist'),
)]
class ReactSearchBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Constructs a new ReactSearchBlock object.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    protected RouteMatchInterface $routeMatch,
    protected ConfigFactoryInterface $configFactory,
    protected SearchPathResolver $searchPathResolver,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    $current_node = $this->routeMatch->getParameter('node');
    $search_page_node_id = $this->searchPathResolver->getSearchPageNodeId();

    if (!$search_page_node_id) {
      return AccessResult::forbidden('Search page node is not configured.');
    }

    if ($current_node instanceof NodeInterface && (int) $current_node->id() === $search_page_node_id) {
      return AccessResult::allowed()->addCacheTags(['config:helhist_search.settings']);
    }

    return AccessResult::forbidden()->addCacheTags(['config:helhist_search.settings']);
  }

  /**
   * {@inheritdoc}
   */
  public function build(): array {
    $mapping_mode = $this->configFactory
      ->get('helhist_search.settings')
      ->get('mapping_mode') ?: 'text';

    return [
      '#theme' => 'react_search',
      '#attached' => [
        'library' => [
          'hdbt_subtheme/react-search-app',
        ],
        'drupalSettings' => [
          'search' => [
            'mappingMode' => $mapping_mode,
          ],
        ],
      ],
    ];
  }

}

<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\helhist_search\SearchPathResolver;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a React Search block.
 *
 * @Block(
 *   id = "helhist_search_react_search_block",
 *   admin_label = @Translation("HelHist React Search"),
 *   category = @Translation("HelHist")
 * )
 *
 * @phpstan-consistent-constructor
 */
class ReactSearchBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The route match.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatch;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The search path resolver service.
   *
   * @var \Drupal\helhist_search\SearchPathResolver
   */
  protected $searchPathResolver;

  /**
   * Constructs a new ReactSearchBlock object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_match
   *   The route match.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Drupal\helhist_search\SearchPathResolver $search_path_resolver
   *   The search path resolver service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    RouteMatchInterface $route_match,
    ConfigFactoryInterface $config_factory,
    SearchPathResolver $search_path_resolver,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->routeMatch = $route_match;
    $this->configFactory = $config_factory;
    $this->searchPathResolver = $search_path_resolver;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('current_route_match'),
      $container->get('config.factory'),
      $container->get('helhist_search.search_path_resolver')
    );
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
  public function build() {
    $mapping_mode = $this->configFactory
      ->get('helhist_search.settings')
      ->get('mapping_mode') ?: 'both';

    $build = [
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

    return $build;
  }

}

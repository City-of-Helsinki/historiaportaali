<?php

declare(strict_types=1);

namespace Drupal\helhist_kore_search\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Site\Settings;
use Drupal\helhist_kore_search\KoreSearchOptionsProvider;
use Drupal\helhist_search\SearchPathResolver;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a KoRe (koulurekisteri) React Search block.
 *
 * @Block(
 *   id = "helhist_kore_search_block",
 *   admin_label = @Translation("HelHist KoRe React Search"),
 *   category = @Translation("HelHist")
 * )
 *
 * @phpstan-consistent-constructor
 */
class KoreSearchBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The route match.
   */
  protected RouteMatchInterface $routeMatch;

  /**
   * The search path resolver service.
   */
  protected SearchPathResolver $searchPathResolver;

  /**
   * The KoRe search options provider.
   */
  protected KoreSearchOptionsProvider $koreSearchOptions;

  /**
   * Constructs a new KoreSearchBlock object.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    RouteMatchInterface $route_match,
    SearchPathResolver $search_path_resolver,
    KoreSearchOptionsProvider $kore_search_options,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->routeMatch = $route_match;
    $this->searchPathResolver = $search_path_resolver;
    $this->koreSearchOptions = $kore_search_options;
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
      $container->get('helhist_search.search_path_resolver'),
      $container->get('helhist_kore_search.kore_search_options')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    $current_node = $this->routeMatch->getParameter('node');
    $kore_search_page_node_id = $this->searchPathResolver->getKoreSearchPageNodeId();

    if (!$kore_search_page_node_id) {
      return AccessResult::forbidden('KoRe search page node is not configured.');
    }

    if ($current_node instanceof NodeInterface && (int) $current_node->id() === $kore_search_page_node_id) {
      return AccessResult::allowed()->addCacheTags(['config:helhist_search.settings']);
    }

    return AccessResult::forbidden()->addCacheTags(['config:helhist_search.settings']);
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $type_options = $this->koreSearchOptions->getAllowedValuesWithLabels('field.storage.paragraph.field_kore_type', TRUE);
    $language_options = $this->koreSearchOptions->getAllowedValuesWithLabels('field.storage.paragraph.field_kore_language');

    return [
      '#theme' => 'kore_react_search',
      '#ELASTIC_PROXY_URL' => Settings::get('elasticsearch_proxy_url', ''),
      '#attached' => [
        'library' => [
          'hdbt_subtheme/kore-search-app',
        ],
        'drupalSettings' => [
          'koreSearch' => [
            'typeOptions' => $type_options,
            'languageOptions' => $language_options,
          ],
        ],
      ],
      '#cache' => [
        'tags' => [
          'config:field.storage.paragraph.field_kore_type',
          'config:field.storage.paragraph.field_kore_language',
        ],
      ],
    ];
  }

}

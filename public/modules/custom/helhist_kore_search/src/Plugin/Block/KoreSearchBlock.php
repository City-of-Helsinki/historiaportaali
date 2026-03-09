<?php

declare(strict_types=1);

namespace Drupal\helhist_kore_search\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\Attribute\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Site\Settings;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\helhist_kore_search\KoreSearchOptionsProvider;
use Drupal\helhist_search\SearchPathResolver;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a KoRe (koulurekisteri) React Search block.
 *
 * @phpstan-consistent-constructor
 */
#[Block(
  id: 'helhist_kore_search_block',
  admin_label: new TranslatableMarkup('HelHist KoRe React Search'),
  category: new TranslatableMarkup('HelHist'),
)]
class KoreSearchBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Constructs a new KoreSearchBlock object.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    protected RouteMatchInterface $routeMatch,
    protected SearchPathResolver $searchPathResolver,
    protected KoreSearchOptionsProvider $koreSearchOptions,
    protected ConfigFactoryInterface $configFactory,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
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
      $container->get('helhist_kore_search.kore_search_options'),
      $container->get('config.factory')
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
    $mapping_mode = $this->configFactory
      ->get('helhist_search.settings')
      ->get('mapping_mode') ?: 'text';

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
            'mappingMode' => $mapping_mode,
            'sortLabels' => [
              'name' => $this->t('School name'),
            ],
          ],
        ],
      ],
      '#cache' => [
        'tags' => [
          'config:field.storage.paragraph.field_kore_type',
          'config:field.storage.paragraph.field_kore_language',
          'config:helhist_search.settings',
        ],
      ],
    ];
  }

}

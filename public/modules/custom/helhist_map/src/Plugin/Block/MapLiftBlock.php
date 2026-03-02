<?php

declare(strict_types=1);

namespace Drupal\helhist_map\Plugin\Block;

use Drupal\Core\Block\Attribute\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a Map Controls block.
 *
 * @phpstan-consistent-constructor
 */
#[Block(
  id: 'helhist_map_map_lift_block',
  admin_label: new TranslatableMarkup('HelHist Map Lift'),
  category: new TranslatableMarkup('HelHist'),
)]
class MapLiftBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Constructs a MapLiftBlock instance.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    protected LanguageManagerInterface $languageManager,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * Creates an instance of the plugin.
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The container to pull out services used in the plugin.
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   *
   * @return static
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('language_manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $language = $this->languageManager->getCurrentLanguage();

    $map_nid = 54;
    $map_node_url = Url::fromRoute(
      'entity.node.canonical',
      ['node' => $map_nid],
      ['language' => $language, 'absolute' => TRUE]
    )->toString();

    $build = [
      '#theme' => 'map_lift_block',
      '#map_node_url' => $map_node_url,
    ];

    return $build;
  }

}

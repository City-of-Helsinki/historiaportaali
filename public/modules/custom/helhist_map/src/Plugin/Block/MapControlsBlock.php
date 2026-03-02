<?php

declare(strict_types=1);

namespace Drupal\helhist_map\Plugin\Block;

use Drupal\Core\Block\Attribute\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\helhist_map\MapService;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a Map Controls block.
 *
 * @phpstan-consistent-constructor
 */
#[Block(
  id: 'helhist_map_map_controls_block',
  admin_label: new TranslatableMarkup('HelHist Map Controls'),
  category: new TranslatableMarkup('HelHist'),
)]
class MapControlsBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Constructs a new MapControlsBlock instance.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    protected MapService $mapService,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
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
      $container->get('helhist_map.mapservice')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#theme' => 'map_controls',
      '#map_layers' => $this->mapService->getMapLayers('map'),
      '#photo_layers' => $this->mapService->getMapLayers('photo'),
    ];

    return $build;
  }

}

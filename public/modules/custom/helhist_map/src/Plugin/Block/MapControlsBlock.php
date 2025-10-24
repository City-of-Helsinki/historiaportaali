<?php

declare(strict_types=1);

namespace Drupal\helhist_map\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\helhist_map\MapService;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a Map Controls block.
 *
 * @Block(
 *   id = "helhist_map_map_controls_block",
 *   admin_label = @Translation("HelHist Map Controls"),
 *   category = @Translation("HelHist")
 * )
 */
class MapControlsBlock extends BlockBase implements ContainerFactoryPluginInterface {
  /**
   * The map service.
   *
   * @var \Drupal\helhist_map\MapService
   */
  protected $mapService;

  /**
   * Constructs a new MapControlsBlock instance.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\helhist_map\MapService $map_service
   *   The map service.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, MapService $map_service) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->mapService = $map_service;
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

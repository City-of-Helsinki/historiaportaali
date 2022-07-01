<?php

/**
 * @file
 * Contains \Drupal\helhist_map\Plugin\Block\ComparisonMapControlsBlock.
 */

namespace Drupal\helhist_map\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\helhist_map\MapService;

/**
 * Provides a Map Controls block
 *
 * @Block(
 *   id = "helhist_map_comparison_map_controls_block",
 *   admin_label = @Translation("HelHist Comparison Map Controls"),
 *   category = @Translation("HelHist")
 * )
 */
class ComparisonMapControlsBlock extends BlockBase implements ContainerFactoryPluginInterface {
  /**
   * @var \Drupal\helhist_map\MapService $map_service
   */
  protected $mapService;

  /**
   * @param array $configuration
   * @param string $plugin_id
   * @param mixed $plugin_definition
   * @param \Drupal\helhist_map\MapService $map_service
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, MapService $map_service) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->mapService = $map_service;
  }

  /**
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   * @param array $configuration
   * @param string $plugin_id
   * @param mixed $plugin_definition
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
      '#theme' => 'comparison_map_controls',
      '#map_layers' => $this->mapService->getMapLayers('map'),
      '#photo_layers' => $this->mapService->getMapLayers('photo')
    ];

    return $build;
  }
}

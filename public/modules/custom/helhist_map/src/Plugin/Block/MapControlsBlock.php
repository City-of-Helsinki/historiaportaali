<?php

declare(strict_types=1);

namespace Drupal\helhist_map\Plugin\Block;

use Drupal\Core\Block\Attribute\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\helhist_map\MapService;

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
   */
  public function build(): array {
    // @fixme: should this have cache tags?
    return [
      '#theme' => 'map_controls',
      '#map_layers' => $this->mapService->getMapLayers('map'),
      '#photo_layers' => $this->mapService->getMapLayers('photo'),
    ];
  }

}

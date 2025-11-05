<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a Search Frontend block.
 *
 * @Block(
 *   id = "helhist_search_search_frontend_block",
 *   admin_label = @Translation("HelHist Search Frontend"),
 *   category = @Translation("HelHist")
 * )
 */
class SearchFrontendBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#theme' => 'search_frontend',
      '#attached' => [
        'library' => [
          'helhist_search/search-frontend-app',
        ],
      ],
    ];

    return $build;
  }

}

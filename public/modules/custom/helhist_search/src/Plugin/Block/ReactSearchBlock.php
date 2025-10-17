<?php

/**
 * @file
 * Contains \Drupal\helhist_search\Plugin\Block\ReactSearchBlock.
 */

namespace Drupal\helhist_search\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a React Search block
 *
 * @Block(
 *   id = "helhist_search_react_search_block",
 *   admin_label = @Translation("HelHist React Search"),
 *   category = @Translation("HelHist")
 * )
 */
class ReactSearchBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#theme' => 'react_search',
      '#attached' => [
        'library' => [
          'hdbt_subtheme/react-search-app'
        ]
      ]
    ];

    return $build;
  }
}

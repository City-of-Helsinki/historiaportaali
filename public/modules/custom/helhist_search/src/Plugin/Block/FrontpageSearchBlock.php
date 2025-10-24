<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a Frontpage Search block.
 *
 * @Block(
 *   id = "helhist_search_frontpage_block",
 *   admin_label = @Translation("HelHist Frontpage Search"),
 *   category = @Translation("HelHist")
 * )
 */
class FrontpageSearchBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $langcode = \Drupal::languageManager()->getCurrentLanguage()->getId();

    switch ($langcode) {
      case "fi":
        $search_page_path = "/fi/haku";
        break;

      case "sv":
        $search_page_path = "/sv/sok";
        break;

      case "en":
        $search_page_path = "/en/search";
        break;

      default:
        $search_page_path = "/fi/haku";
    }

    $build = [
      '#theme' => 'frontpage_search',
      '#search_page_path' => $search_page_path,
    ];

    return $build;
  }

}

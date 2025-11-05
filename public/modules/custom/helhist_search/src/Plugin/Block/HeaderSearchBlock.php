<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a Header Search block.
 *
 * @Block(
 *   id = "helhist_search_header_search_block",
 *   admin_label = @Translation("HelHist Header Search"),
 *   category = @Translation("HelHist")
 * )
 *
 * @phpstan-consistent-constructor
 */
class HeaderSearchBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The language manager service.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * Constructs a new HeaderSearchBlock object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    LanguageManagerInterface $language_manager,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->languageManager = $language_manager;
  }

  /**
   * {@inheritdoc}
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
    $langcode = $this->languageManager->getCurrentLanguage()->getId();

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
      '#theme' => 'header_search',
      '#search_page_path' => $search_page_path,
    ];

    return $build;
  }

}

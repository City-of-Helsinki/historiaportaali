<?php

declare(strict_types=1);

namespace Drupal\helhist_map\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a Map Controls block.
 *
 * @Block(
 *   id = "helhist_map_map_lift_block",
 *   admin_label = @Translation("HelHist Map Lift"),
 *   category = @Translation("HelHist")
 * )
 *
 * @phpstan-consistent-constructor
 */
class MapLiftBlock extends BlockBase implements ContainerFactoryPluginInterface {
  /**
   * The language manager service.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * Constructs a MapLiftBlock instance.
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
  public function __construct(array $configuration, $plugin_id, $plugin_definition, LanguageManagerInterface $language_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->languageManager = $language_manager;
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

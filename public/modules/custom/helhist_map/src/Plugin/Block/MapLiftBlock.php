<?php

/**
 * @file
 * Contains \Drupal\helhist_map\Plugin\Block\MapLiftBlock.
 */

namespace Drupal\helhist_map\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Url;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Language\LanguageManagerInterface;

/**
 * Provides a Map Controls block
 *
 * @Block(
 *   id = "helhist_map_map_lift_block",
 *   admin_label = @Translation("HelHist Map Lift"),
 *   category = @Translation("HelHist")
 * )
 */
class MapLiftBlock extends BlockBase implements ContainerFactoryPluginInterface {
  /**
   * The language manager service.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * @param array $configuration
   * @param string $plugin_id
   * @param mixed $plugin_definition
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager service.
   * @param \Drupal\path_alias\AliasManagerInterface $path_alias_manager
   *   The path alias manager service.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, LanguageManagerInterface $language_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->languageManager = $language_manager;
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
      $container->get('language_manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $language = $this->languageManager->getCurrentLanguage();
    
    $map_nid = 54;
    $map_node_url = Url::fromRoute('entity.node.canonical', ['node' => $map_nid], ['language' => $language, 'absolute' => TRUE])->toString();

    $build = [
      '#theme' => 'map_lift_block',
      '#map_node_url' => $map_node_url
    ];

    return $build;
  }
}

<?php

namespace Drupal\helhist_kore_admin\Plugin\views\area;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\views\Plugin\views\area\AreaPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @ViewsArea("kore_search_content")
 */
class KoreSearchContent extends AreaPluginBase {

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory'),
      $container->get('language_manager')
    );
  }

  /**
   * Constructs a new KoreSearchContent object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ConfigFactoryInterface $config_factory, LanguageManagerInterface $language_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configFactory = $config_factory;
    $this->languageManager = $language_manager;
  }

  /**
   * {@inheritdoc}
   */
  public function render($empty = FALSE) {
    $config = $this->configFactory->get('helhist_kore_admin.settings');
    $language = $this->languageManager->getCurrentLanguage()->getId();

    $title = $config->get('kore_search_title.' . $language) ?? '';
    $text = $config->get('kore_search_text.' . $language)['value'] ?? '';

    if (empty($title) && empty($text)) {
      return [];
    }

    $build = [
      '#type' => 'container',
      '#attributes' => [
        'class' => ['kore-search-content'],
      ],
    ];

    if ($title) {
      $build['title'] = [
        '#type' => 'html_tag',
        '#tag' => 'h1',
        '#value' => $title,
        '#attributes' => [
          'class' => ['kore-search-title'],
        ],
      ];
    }

    if ($text) {
      $build['text'] = [
        '#type' => 'processed_text',
        '#text' => $text,
        '#format' => 'full_html',
        '#attributes' => [
          'class' => ['kore-search-text'],
        ],
      ];
    }

    return $build;
  }

}

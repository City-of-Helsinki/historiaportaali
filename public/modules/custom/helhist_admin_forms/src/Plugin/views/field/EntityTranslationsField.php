<?php

declare(strict_types=1);

namespace Drupal\helhist_admin_forms\Plugin\views\field;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\views\Plugin\views\field\FieldPluginBase;
use Drupal\views\ResultRow;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Views field handler for entity translations.
 *
 * @ingroup views_field_handlers
 *
 * @ViewsField("entity_translations_field")
 * 
 * @phpstan-consistent-constructor
 */
class EntityTranslationsField extends FieldPluginBase {

  /**
   * Constructs a new EntityTranslationsField object.
   *
   * @param array<string, mixed> $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Language\LanguageManagerInterface $languageManager
   *   The language manager service.
   */
  public function __construct(
    array $configuration,
    string $plugin_id,
    mixed $plugin_definition,
    protected LanguageManagerInterface $languageManager,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
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
  public function usesGroupBy(): bool {
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function query(): void {
    // Do nothing.
  }

  /**
   * {@inheritdoc}
   */
  protected function defineOptions(): array {
    $options = parent::defineOptions();
    $options['hide_alter_empty'] = ['default' => FALSE];
    return $options;
  }

  /**
   * {@inheritdoc}
   */
  // @phpstan-ignore-next-line
  public function render(ResultRow $values): array {
    $entity = $values->_entity;
    $langcodes = array_keys($this->languageManager->getLanguages());
    $translations = [
      '#theme' => 'item_list',
      '#list_type' => 'ul',
      '#items' => [],
    ];

    if ($entity instanceof ContentEntityInterface) {
      foreach ($langcodes as $langcode) {
        if ($entity->hasTranslation($langcode)) {
          $translations['#items'][] = ['#markup' => $langcode];
        }
      }
    }

    return $translations;
  }

}

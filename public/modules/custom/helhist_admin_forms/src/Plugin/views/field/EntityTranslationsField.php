<?php

declare(strict_types=1);

namespace Drupal\helhist_admin_forms\Plugin\views\field;

use Drupal\views\Plugin\views\field\FieldPluginBase;
use Drupal\views\ResultRow;

/**
 * Views field handler for entity translations.
 *
 * @ingroup views_field_handlers
 *
 * @ViewsField("entity_translations_field")
 */
class EntityTranslationsField extends FieldPluginBase {

  /**
   * {@inheritdoc}
   */
  public function usesGroupBy() {
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function query() {
    // Do nothing.
  }

  /**
   * {@inheritdoc}
   */
  protected function defineOptions() {
    $options = parent::defineOptions();
    $options['hide_alter_empty'] = ['default' => FALSE];
    return $options;
  }

  /**
   * {@inheritdoc}
   */
  public function render(ResultRow $values) {
    $entity = $values->_entity;
    $langcodes = \Drupal::languageManager()->getLanguages();
    $langcodes = array_keys($langcodes);
    $translations = [
      '#theme' => 'item_list',
      '#list_type' => 'ul',
      '#items' => [],
    ];
    foreach ($langcodes as $langcode) {
      if ($entity->hasTranslation($langcode)) {
        $translations['#items'][] = ['#markup' => $langcode];
      }
    }

    return $translations;
  }

}

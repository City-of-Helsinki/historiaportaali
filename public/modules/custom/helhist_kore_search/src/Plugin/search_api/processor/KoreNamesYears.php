<?php

declare(strict_types=1);

namespace Drupal\helhist_kore_search\Plugin\search_api\processor;

use Drupal\search_api\Datasource\DatasourceInterface;
use Drupal\search_api\Item\ItemInterface;
use Drupal\search_api\Processor\ProcessorPluginBase;
use Drupal\search_api\Processor\ProcessorProperty;

/**
 * Computes KoRe school names with years for indexing.
 *
 * @SearchApiProcessor(
 *   id = "kore_names_years",
 *   label = @Translation("KoRe names with years"),
 *   description = @Translation("Computes kore_start_year, kore_end_year and kore_names with year ranges for display"),
 *   stages = {
 *     "add_properties" = 0,
 *   },
 *   locked = true,
 *   hidden = false,
 * )
 */
class KoreNamesYears extends ProcessorPluginBase {

  /**
   * {@inheritdoc}
   */
  public function getPropertyDefinitions(?DatasourceInterface $datasource = NULL) {
    $properties = [];

    if (!$datasource) {
      $base = [
        'processor_id' => $this->getPluginId(),
      ];
      $properties['kore_start_year'] = new ProcessorProperty([
        'label' => $this->t('KoRe start year'),
        'description' => $this->t('First year of operation (min of all school names)'),
        'type' => 'integer',
        ...$base,
      ]);
      $properties['kore_end_year'] = new ProcessorProperty([
        'label' => $this->t('KoRe end year'),
        'description' => $this->t('Last year of operation (max of all school names)'),
        'type' => 'integer',
        ...$base,
      ]);
      $properties['kore_name_entries'] = new ProcessorProperty([
        'label' => $this->t('KoRe name entries'),
        'description' => $this->t('Structured name + start_year + end_year per entry (JSON)'),
        'type' => 'string',
        ...$base,
      ]);
    }

    return $properties;
  }

  /**
   * {@inheritdoc}
   */
  public function addFieldValues(ItemInterface $item) {
    $entity = $item->getOriginalObject()->getValue();
    if (!$entity || $entity->getEntityTypeId() !== 'node' || $entity->bundle() !== 'kore_school') {
      return;
    }

    $names_field = $entity->get('field_kore_names');
    if ($names_field->isEmpty()) {
      return;
    }

    $items = [];
    $all_starts = [];
    $all_ends = [];

    foreach ($names_field->referencedEntities() as $paragraph) {
      $name = $paragraph->get('field_kore_name')->value ?? '';
      $start = $paragraph->get('field_kore_start_year')->value;
      $end = $paragraph->get('field_kore_end_year')->value;

      if ($name === '') {
        continue;
      }

      $start_int = $start !== NULL && $start !== '' ? (int) $start : NULL;
      $end_int = $end !== NULL && $end !== '' ? (int) $end : NULL;

      if ($start_int !== NULL) {
        $all_starts[] = $start_int;
      }
      if ($end_int !== NULL) {
        $all_ends[] = $end_int;
      }

      $items[] = [
        'name' => $name,
        'start' => $start_int,
        'end' => $end_int,
      ];
    }

    // Sort by start year descending (newest first).
    usort($items, fn($a, $b) => ($b['start'] ?? 0) <=> ($a['start'] ?? 0));

    $kore_start_year = $all_starts ? min($all_starts) : NULL;
    $kore_end_year = $all_ends ? max($all_ends) : NULL;

    $kore_name_entries = array_map(function ($i) {
      return json_encode([
        'name' => $i['name'],
        'start_year' => $i['start'],
        'end_year' => $i['end'] ?? NULL,
      ], JSON_THROW_ON_ERROR);
    }, $items);

    $fields_helper = $this->getFieldsHelper();

    $fields = $fields_helper->filterForPropertyPath($item->getFields(), NULL, 'kore_start_year');
    foreach ($fields as $field) {
      if ($kore_start_year !== NULL) {
        $field->addValue($kore_start_year);
      }
    }

    $fields = $fields_helper->filterForPropertyPath($item->getFields(), NULL, 'kore_end_year');
    foreach ($fields as $field) {
      if ($kore_end_year !== NULL) {
        $field->addValue($kore_end_year);
      }
    }

    $fields = $fields_helper->filterForPropertyPath($item->getFields(), NULL, 'kore_name_entries');
    foreach ($fields as $field) {
      foreach ($kore_name_entries as $entry) {
        $field->addValue($entry);
      }
    }
  }

}

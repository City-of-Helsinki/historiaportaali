<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Plugin\search_api\processor;

use Drupal\search_api\Datasource\DatasourceInterface;
use Drupal\search_api\Item\ItemInterface;
use Drupal\search_api\Processor\ProcessorPluginBase;
use Drupal\search_api\Processor\ProcessorProperty;

/**
 * Adds a custom type filter to the indexed data.
 *
 * @SearchApiProcessor(
 *   id = "content_type",
 *   label = @Translation("Content Type"),
 *   description = @Translation("Add a content type to search index (article / media)"),
 *   stages = {
 *     "add_properties" = 0,
 *   },
 *   locked = true,
 *   hidden = false,
 * )
 */
class ContentType extends ProcessorPluginBase {

  /**
   * Machine name of the processor.
   *
   * @var string
   */
  protected $processorId = 'content_type';

  /**
   * {@inheritdoc}
   */
  public function getPropertyDefinitions(DatasourceInterface $datasource = NULL) {
    $properties = [];

    if (!$datasource) {
      $definition = [
        'label' => $this->t('Content Type'),
        'description' => $this->t('(article / media)'),
        'type' => 'string',
        'processor_id' => $this->getPluginId(),
      ];
      $properties[$this->processorId] = new ProcessorProperty($definition);
    }

    return $properties;
  }

  /**
   * {@inheritdoc}
   */
  public function addFieldValues(ItemInterface $item) {
    $content_type = '';

    $entity = $item->getOriginalObject()->getValue();
    $entity_type = $entity->getEntityTypeId();

    if ($entity_type == 'media') {
      $content_type = 'media';
    }

    if ($entity_type == 'node') {
      $content_type = 'article';
    }

    $fields = $this->getFieldsHelper()
      ->filterForPropertyPath($item->getFields(), NULL, $this->processorId);
    foreach ($fields as $field) {
      $field->addValue($content_type);
    }
  }

}

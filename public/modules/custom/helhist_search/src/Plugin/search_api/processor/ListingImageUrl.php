<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Plugin\search_api\processor;

use Drupal\file\Entity\File;
use Drupal\image\Entity\ImageStyle;
use Drupal\search_api\Datasource\DatasourceInterface;
use Drupal\search_api\Item\ItemInterface;
use Drupal\search_api\Processor\ProcessorPluginBase;
use Drupal\search_api\Processor\ProcessorProperty;

/**
 * Adds a custom type filter to the indexed data.
 *
 * @SearchApiProcessor(
 *   id = "listing_image_url",
 *   label = @Translation("Listing Image URL"),
 *   description = @Translation("Add a listing image url to search index"),
 *   stages = {
 *     "add_properties" = 0,
 *   },
 *   locked = true,
 *   hidden = false,
 * )
 */
class ListingImageUrl extends ProcessorPluginBase {

  /**
   * Machine name of the processor.
   *
   * @var string
   */
  protected $processor_id = 'listing_image_url';

  /**
   * {@inheritdoc}
   */
  public function getPropertyDefinitions(DatasourceInterface $datasource = NULL) {
    $properties = [];

    if (!$datasource) {
      $definition = [
        'label' => $this->t('Listing Image URL'),
        'description' => $this->t('listing image url'),
        'type' => 'string',
        'processor_id' => $this->getPluginId(),
      ];
      $properties[$this->processor_id] = new ProcessorProperty($definition);
    }

    return $properties;
  }

  /**
   * {@inheritdoc}
   */
  public function addFieldValues(ItemInterface $item) {
    $entity = $item->getOriginalObject()->getValue();
    $entity_type = $entity->getEntityTypeId();

    if ($entity_type == 'media') {
      $media = $entity;
    }

    if ($entity_type == 'node') {
      $media = $entity->field_liftup_image->entity;
    }

    if (isset($media)) {
      $fid = $media->getSource()->getSourceFieldValue($media);
      $file = File::load($fid);
    }

    if (isset($file)) {
      $image_style = ImageStyle::load('1.5_600w_400h');
      $image_uri = $file->getFileUri();

      if ($image_uri) {
        $destination_uri = $image_style->buildUri($file->uri->value);
        $image_style->createDerivative($image_uri, $destination_uri);

        $destination_url = $image_style->buildUrl($file->uri->value);

        $fields = $this->getFieldsHelper()
          ->filterForPropertyPath($item->getFields(), NULL, $this->processor_id);
        foreach ($fields as $field) {
          $field->addValue($destination_url);
        }
      }
    }
  }

}

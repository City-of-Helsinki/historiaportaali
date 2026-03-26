<?php

declare(strict_types=1);

namespace Drupal\Tests\helhist_search\Kernel\Plugin\SearchApi\Processor;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\file\Entity\File;
use Drupal\image\Entity\ImageStyle;
use Drupal\media\Entity\Media;
use Drupal\media\Entity\MediaType;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\search_api\Item\Field;
use Drupal\Tests\search_api\Kernel\Processor\ProcessorTestBase;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;

/**
 * Tests the ListingImageUrl processor.
 */
#[Group('helhist_search')]
#[RunTestsInSeparateProcesses]
class ListingImageUrlProcessorTest extends ProcessorTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'helhist_search',
    'helfi_platform_config',
    'config_rewrite',
    'helfi_api_base',
    'media',
    'image',
    'file',
  ];

  /**
   * {@inheritdoc}
   */
  public function setUp($processor = NULL): void {
    parent::setUp('listing_image_url');

    $this->installEntitySchema('media');
    $this->installEntitySchema('file');
    $this->installSchema('file', ['file_usage']);
    $this->installConfig(['media']);

    // Add media datasource to the index.
    $datasources = \Drupal::getContainer()
      ->get('search_api.plugin_helper')
      ->createDatasourcePlugins($this->index, ['entity:node', 'entity:media']);
    $this->index->setDatasources($datasources);

    // Add the processor field to the index.
    $field = new Field($this->index, 'listing_image_url');
    $field->setType('string');
    $field->setPropertyPath('listing_image_url');
    $field->setLabel('Listing Image URL');
    $this->index->addField($field);
    $this->index->save();

    // Create the image style used by the processor.
    ImageStyle::create([
      'name' => '1.5_600w_400h',
    ])->save();

    // Create media type with image source.
    $media_type = MediaType::create([
      'id' => 'image',
      'label' => 'Image',
      'source' => 'image',
    ]);
    $media_type->save();
    $source_field = $media_type->getSource()->createSourceField($media_type);
    /** @var \Drupal\field\Entity\FieldStorageConfig $storage */
    $storage = $source_field->getFieldStorageDefinition();
    $storage->save();
    $source_field->save();
    $media_type->set('source_configuration', [
      'source_field' => $source_field->getName(),
    ])->save();

    // Create node type with field_liftup_image entity reference to media.
    NodeType::create([
      'type' => 'article',
      'name' => 'Article',
    ])->save();

    FieldStorageConfig::create([
      'field_name' => 'field_liftup_image',
      'entity_type' => 'node',
      'type' => 'entity_reference',
      'settings' => [
        'target_type' => 'media',
      ],
    ])->save();

    FieldConfig::create([
      'field_name' => 'field_liftup_image',
      'entity_type' => 'node',
      'bundle' => 'article',
      'label' => 'Liftup Image',
    ])->save();
  }

  /**
   * Tests that the processor defines the correct properties.
   */
  public function testPropertyDefinitions(): void {
    $properties = $this->processor->getPropertyDefinitions();
    $this->assertArrayHasKey('listing_image_url', $properties);
    $this->assertEquals('string', $properties['listing_image_url']->getDataType());
  }

  /**
   * Tests that a node with an image gets a styled image URL.
   */
  public function testAddFieldValuesWithImage(): void {
    // Create a test image file.
    $file = File::create([
      'uri' => 'public://test-image.png',
      'filename' => 'test-image.png',
      'filemime' => 'image/png',
      'status' => 1,
    ]);
    // Create a minimal valid PNG so image validation passes.
    file_put_contents($file->getFileUri(), file_get_contents('core/tests/fixtures/files/image-1.png'));
    $file->save();

    $media = Media::create([
      'bundle' => 'image',
      'name' => 'Test image',
      'field_media_image' => [
        'target_id' => $file->id(),
        'alt' => 'Test',
      ],
    ]);
    $media->save();

    $node = Node::create([
      'type' => 'article',
      'title' => 'Test node',
      'field_liftup_image' => ['target_id' => $media->id()],
    ]);
    $node->save();

    $items = $this->generateItems([
      [
        'datasource' => 'entity:node',
        'item' => $node->getTypedData(),
        'item_id' => $node->id() . ':en',
      ],
    ]);

    $this->processor->addFieldValues(array_first($items));

    $field = array_first($items)->getField('listing_image_url');
    $values = $field->getValues();
    $this->assertNotEmpty($values);
    $this->assertStringContainsString('1.5_600w_400h', $values[0]);
  }

}

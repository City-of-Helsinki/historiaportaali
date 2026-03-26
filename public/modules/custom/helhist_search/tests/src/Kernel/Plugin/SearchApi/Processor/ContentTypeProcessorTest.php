<?php

declare(strict_types=1);

namespace Drupal\Tests\helhist_search\Kernel\Plugin\SearchApi\Processor;

use Drupal\media\Entity\Media;
use Drupal\media\Entity\MediaType;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\search_api\Item\Field;
use Drupal\Tests\search_api\Kernel\Processor\ProcessorTestBase;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;

/**
 * Tests the ContentType processor.
 */
#[Group('helhist_search')]
#[RunTestsInSeparateProcesses]
class ContentTypeProcessorTest extends ProcessorTestBase {

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
    parent::setUp('content_type');

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
    $field = new Field($this->index, 'content_type');
    $field->setType('string');
    $field->setPropertyPath('content_type');
    $field->setLabel('Content Type');
    $this->index->addField($field);
    $this->index->save();

    NodeType::create([
      'type' => 'article',
      'name' => 'Article',
    ])->save();

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
  }

  /**
   * Tests that the processor defines the correct properties.
   */
  public function testPropertyDefinitions(): void {
    $properties = $this->processor->getPropertyDefinitions();
    $this->assertArrayHasKey('content_type', $properties);
    $this->assertEquals('string', $properties['content_type']->getDataType());
  }

  /**
   * Tests that a node item gets the 'article' content type value.
   */
  public function testAddFieldValuesNode(): void {
    $node = Node::create([
      'type' => 'article',
      'title' => 'Test node',
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

    $field = array_first($items)->getField('content_type');
    $this->assertEquals(['article'], $field->getValues());
  }

  /**
   * Tests that a media item gets the 'media' content type value.
   */
  public function testAddFieldValuesMedia(): void {
    $media = Media::create([
      'bundle' => 'image',
      'name' => 'Test media',
    ]);
    $media->save();

    $items = $this->generateItems([
      [
        'datasource' => 'entity:media',
        'item' => $media->getTypedData(),
        'item_id' => $media->id() . ':en',
      ],
    ]);

    $this->processor->addFieldValues(array_first($items));

    $field = array_first($items)->getField('content_type');
    $this->assertEquals(['media'], $field->getValues());
  }

}

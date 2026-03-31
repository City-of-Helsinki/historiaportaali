<?php

declare(strict_types=1);

namespace Drupal\Tests\helhist_kore_search\Kernel\Plugin\SearchApi\Processor;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\paragraphs\Entity\ParagraphsType;
use Drupal\search_api\Item\Field;
use Drupal\Tests\search_api\Kernel\Processor\ProcessorTestBase;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;

/**
 * Tests the KoreNamesYears processor.
 */
#[Group('helhist_kore_search')]
#[RunTestsInSeparateProcesses]
class KoreNamesYearsTest extends ProcessorTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'helhist_kore_search',
    'helhist_search',
    'helfi_platform_config',
    'config_rewrite',
    'helfi_api_base',
    'paragraphs',
    'entity_reference_revisions',
    'file',
  ];

  /**
   * {@inheritdoc}
   */
  public function setUp($processor = NULL): void {
    parent::setUp('kore_names_years');

    $this->installEntitySchema('paragraph');

    // Add processor fields to the index.
    foreach (['kore_start_year' => 'integer', 'kore_end_year' => 'integer', 'kore_name_entries' => 'string'] as $name => $type) {
      $field = new Field($this->index, $name);
      $field->setType($type);
      $field->setPropertyPath($name);
      $field->setLabel($name);
      $this->index->addField($field);
    }
    $this->index->save();

    // Create kore_name paragraph type with fields.
    ParagraphsType::create([
      'id' => 'kore_name',
      'label' => 'KoRe Name',
    ])->save();

    FieldStorageConfig::create([
      'field_name' => 'field_kore_name',
      'entity_type' => 'paragraph',
      'type' => 'string',
    ])->save();

    FieldStorageConfig::create([
      'field_name' => 'field_kore_start_year',
      'entity_type' => 'paragraph',
      'type' => 'integer',
    ])->save();

    FieldStorageConfig::create([
      'field_name' => 'field_kore_end_year',
      'entity_type' => 'paragraph',
      'type' => 'integer',
    ])->save();

    foreach (['field_kore_name', 'field_kore_start_year', 'field_kore_end_year'] as $field_name) {
      FieldConfig::create([
        'field_name' => $field_name,
        'entity_type' => 'paragraph',
        'bundle' => 'kore_name',
        'label' => $field_name,
      ])->save();
    }

    // Create kore_school node type with entity_reference_revisions field.
    NodeType::create([
      'type' => 'kore_school',
      'name' => 'KoRe School',
    ])->save();

    FieldStorageConfig::create([
      'field_name' => 'field_kore_names',
      'entity_type' => 'node',
      'type' => 'entity_reference_revisions',
      'settings' => [
        'target_type' => 'paragraph',
      ],
    ])->save();

    FieldConfig::create([
      'field_name' => 'field_kore_names',
      'entity_type' => 'node',
      'bundle' => 'kore_school',
      'label' => 'KoRe Names',
    ])->save();
  }

  /**
   * Tests that the processor defines the correct properties.
   */
  public function testPropertyDefinitions(): void {
    $properties = $this->processor->getPropertyDefinitions();

    $this->assertArrayHasKey('kore_start_year', $properties);
    $this->assertEquals('integer', $properties['kore_start_year']->getDataType());

    $this->assertArrayHasKey('kore_end_year', $properties);
    $this->assertEquals('integer', $properties['kore_end_year']->getDataType());

    $this->assertArrayHasKey('kore_name_entries', $properties);
    $this->assertEquals('string', $properties['kore_name_entries']->getDataType());
  }

  /**
   * Tests field values with multiple school names.
   */
  public function testAddFieldValuesMultipleNames(): void {
    $paragraph1 = Paragraph::create([
      'type' => 'kore_name',
      'field_kore_name' => 'Old School',
      'field_kore_start_year' => 1900,
      'field_kore_end_year' => 1950,
    ]);
    $paragraph1->save();

    $paragraph2 = Paragraph::create([
      'type' => 'kore_name',
      'field_kore_name' => 'New School',
      'field_kore_start_year' => 1950,
      'field_kore_end_year' => 2000,
    ]);
    $paragraph2->save();

    $node = Node::create([
      'type' => 'kore_school',
      'title' => 'Test school',
      'field_kore_names' => [
        ['target_id' => $paragraph1->id(), 'target_revision_id' => $paragraph1->getRevisionId()],
        ['target_id' => $paragraph2->id(), 'target_revision_id' => $paragraph2->getRevisionId()],
      ],
    ]);
    $node->save();

    $items = $this->generateItems([
      [
        'datasource' => 'entity:node',
        'item' => $node->getTypedData(),
        'item_id' => $node->id() . ':en',
      ],
    ]);

    $item = array_first($items);
    $this->processor->addFieldValues($item);

    // Start year = min(1900, 1950) = 1900.
    $this->assertEquals([1900], $item->getField('kore_start_year')->getValues());
    // End year = max(1950, 2000) = 2000.
    $this->assertEquals([2000], $item->getField('kore_end_year')->getValues());

    // Name entries sorted by start year descending (newest first).
    $entries = $item->getField('kore_name_entries')->getValues();
    $this->assertCount(2, $entries);

    $first = json_decode($entries[0], TRUE);
    $this->assertEquals('New School', $first['name']);
    $this->assertEquals(1950, $first['start_year']);

    $second = json_decode($entries[1], TRUE);
    $this->assertEquals('Old School', $second['name']);
    $this->assertEquals(1900, $second['start_year']);
  }

}

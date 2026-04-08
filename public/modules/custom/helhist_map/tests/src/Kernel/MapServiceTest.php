<?php

declare(strict_types=1);

namespace Drupal\Tests\helhist_map\Kernel;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\helhist_map\MapService;
use Drupal\KernelTests\KernelTestBase;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\paragraphs\Entity\ParagraphsType;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;

/**
 * Tests the MapService.
 */
#[Group('helhist_map')]
#[RunTestsInSeparateProcesses]
class MapServiceTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    'user',
    'node',
    'field',
    'text',
    'file',
    'options',
    'paragraphs',
    'entity_reference_revisions',
    'helhist_map',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('node');
    $this->installEntitySchema('user');
    $this->installEntitySchema('paragraph');

    NodeType::create(['type' => 'map_layer', 'name' => 'Map Layer'])->save();

    // Node fields.
    FieldStorageConfig::create([
      'field_name' => 'field_layer_title',
      'entity_type' => 'node',
      'type' => 'string',
    ])->save();
    FieldConfig::create([
      'field_name' => 'field_layer_title',
      'entity_type' => 'node',
      'bundle' => 'map_layer',
      'label' => 'Layer Title',
    ])->save();

    FieldStorageConfig::create([
      'field_name' => 'field_layer_type',
      'entity_type' => 'node',
      'type' => 'list_string',
      'settings' => [
        'allowed_values' => [
          'map' => 'Map',
          'photo' => 'Aerial photo',
        ],
      ],
    ])->save();
    FieldConfig::create([
      'field_name' => 'field_layer_type',
      'entity_type' => 'node',
      'bundle' => 'map_layer',
      'label' => 'Layer Type',
    ])->save();

    FieldStorageConfig::create([
      'field_name' => 'field_map_api_endpoints',
      'entity_type' => 'node',
      'type' => 'entity_reference_revisions',
      'settings' => ['target_type' => 'paragraph'],
      'cardinality' => -1,
    ])->save();
    FieldConfig::create([
      'field_name' => 'field_map_api_endpoints',
      'entity_type' => 'node',
      'bundle' => 'map_layer',
      'label' => 'Map API Endpoints',
    ])->save();

    // Paragraph type and fields.
    ParagraphsType::create([
      'id' => 'map_api_endpoint',
      'label' => 'Map API Endpoint',
    ])->save();

    FieldStorageConfig::create([
      'field_name' => 'field_map_api',
      'entity_type' => 'paragraph',
      'type' => 'list_string',
      'settings' => [
        'allowed_values' => [
          'kartta_hel_fi' => 'kartta.hel.fi',
        ],
      ],
    ])->save();
    FieldConfig::create([
      'field_name' => 'field_map_api',
      'entity_type' => 'paragraph',
      'bundle' => 'map_api_endpoint',
      'label' => 'Map API',
    ])->save();

    FieldStorageConfig::create([
      'field_name' => 'field_map_wms_title',
      'entity_type' => 'paragraph',
      'type' => 'string',
    ])->save();
    FieldConfig::create([
      'field_name' => 'field_map_wms_title',
      'entity_type' => 'paragraph',
      'bundle' => 'map_api_endpoint',
      'label' => 'WMS Title',
    ])->save();
  }

  /**
   * Creates a map layer node with endpoints.
   *
   * @param string $title
   *   The layer title.
   * @param string $type
   *   The layer type (map or photo).
   * @param array $endpoints
   *   Array of ['api' => ..., 'wms_title' => ...].
   * @param bool $published
   *   Whether the node is published.
   *
   * @return \Drupal\node\Entity\Node
   *   The created node.
   */
  protected function createMapLayerNode(string $title, string $type, array $endpoints, bool $published = TRUE): Node {
    $paragraphs = [];
    foreach ($endpoints as $endpoint) {
      $paragraph = Paragraph::create([
        'type' => 'map_api_endpoint',
        'field_map_api' => $endpoint['api'],
        'field_map_wms_title' => $endpoint['wms_title'],
      ]);
      $paragraph->save();
      $paragraphs[] = [
        'target_id' => $paragraph->id(),
        'target_revision_id' => $paragraph->getRevisionId(),
      ];
    }

    $node = Node::create([
      'type' => 'map_layer',
      'title' => $title,
      'status' => $published ? 1 : 0,
      'field_layer_title' => $title,
      'field_layer_type' => $type,
      'field_map_api_endpoints' => $paragraphs,
    ]);
    $node->save();

    return $node;
  }

  /**
   * Tests getMapLayers returns layers sorted by year and filters by type.
   */
  public function testGetMapLayers(): void {
    /** @var \Drupal\helhist_map\MapService $service */
    $service = $this->container->get(MapService::class);

    // Empty result when no nodes exist.
    $this->assertEmpty($service->getMapLayers('map'));

    // Create map layers with years in titles.
    $this->createMapLayerNode('Helsinki 1960', 'map', [
      ['api' => 'kartta_hel_fi', 'wms_title' => 'layer_1960'],
    ]);
    $this->createMapLayerNode('Helsinki 1820', 'map', [
      ['api' => 'kartta_hel_fi', 'wms_title' => 'layer_1820_a'],
      ['api' => 'kartta_hel_fi', 'wms_title' => 'layer_1820_b'],
    ]);
    // Aerial photo — should not appear in 'map' query.
    $this->createMapLayerNode('Aerial 2000', 'photo', [
      ['api' => 'kartta_hel_fi', 'wms_title' => 'aerial_2000'],
    ]);
    // Unpublished — should not appear.
    $this->createMapLayerNode('Helsinki 1900', 'map', [
      ['api' => 'kartta_hel_fi', 'wms_title' => 'layer_1900'],
    ], FALSE);

    $layers = $service->getMapLayers('map');

    // Only the two published map layers should be returned.
    $this->assertCount(2, $layers);

    // Sorted by year: 1820 first, 1960 second.
    $keys = array_keys($layers);
    $this->assertEquals('Helsinki 1820', $keys[0]);
    $this->assertEquals('Helsinki 1960', $keys[1]);

    // Verify structure and endpoints.
    $layer1820 = $layers['Helsinki 1820'];
    $this->assertEquals('Helsinki 1820', $layer1820['layer_title']);
    $this->assertEquals(1820, $layer1820['year']);
    $endpoints = json_decode($layer1820['map_api_endpoints'], TRUE);
    $this->assertCount(2, $endpoints);
    $this->assertEquals('kartta_hel_fi', $endpoints[0]['map_api']);
    $this->assertEquals('layer_1820_a', $endpoints[0]['wms_title']);

    // Verify photo type query returns only aerial photo.
    $photoLayers = $service->getMapLayers('photo');
    $this->assertCount(1, $photoLayers);
    $this->assertArrayHasKey('Aerial 2000', $photoLayers);
  }

  /**
   * Tests that 'map' type includes nodes without field_layer_type set.
   */
  public function testMapTypeIncludesNodesWithoutLayerType(): void {
    /** @var \Drupal\helhist_map\MapService $service */
    $service = $this->container->get(MapService::class);

    // Node without field_layer_type — should appear for 'map' queries.
    $node = Node::create([
      'type' => 'map_layer',
      'title' => 'Legacy 1850',
      'status' => 1,
      'field_layer_title' => 'Legacy 1850',
      'field_map_api_endpoints' => [],
    ]);
    $node->save();

    $layers = $service->getMapLayers('map');
    $this->assertCount(1, $layers);
    $this->assertArrayHasKey('Legacy 1850', $layers);

    // But not for 'photo' queries.
    $photoLayers = $service->getMapLayers('photo');
    $this->assertEmpty($photoLayers);
  }

}

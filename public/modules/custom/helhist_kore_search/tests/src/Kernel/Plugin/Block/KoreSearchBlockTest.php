<?php

declare(strict_types=1);

namespace Drupal\Tests\helhist_kore_search\Kernel\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\BlockPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Site\Settings;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\KernelTests\KernelTestBase;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * Tests the KoreSearchBlock.
 */
#[Group('helhist_kore_search')]
#[RunTestsInSeparateProcesses]
class KoreSearchBlockTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    'user',
    'node',
    'field',
    'text',
    'helhist_kore_search',
    'helhist_search',
    'helfi_platform_config',
    'config_rewrite',
    'helfi_api_base',
    'search_api',
    'entity_reference_revisions',
    'paragraphs',
    'file',
    'options',
  ];

  /**
   * The route match mock.
   */
  protected RouteMatchInterface&MockObject $routeMatch;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('node');
    $this->installEntitySchema('user');

    NodeType::create(['type' => 'page', 'name' => 'Page'])->save();

    $this->routeMatch = $this->createMock(RouteMatchInterface::class);
    $this->container->set('current_route_match', $this->routeMatch);
  }

  /**
   * Creates the KoRe search block instance.
   */
  protected function createBlock(): BlockPluginInterface {
    /** @var \Drupal\Core\Block\BlockManagerInterface $blockManager */
    $blockManager = $this->container->get('plugin.manager.block');
    return $blockManager->createInstance('helhist_kore_search_block');
  }

  /**
   * Sets the KoRe search page node ID in config.
   */
  protected function setKoreSearchPageNode(int $node_id): void {
    $this->config('helhist_search.settings')
      ->set('kore_search_page_node', $node_id)
      ->save();
  }

  /**
   * Invokes the protected blockAccess method.
   */
  protected function getBlockAccess(): AccessResult {
    $block = $this->createBlock();
    $method = new \ReflectionMethod($block, 'blockAccess');
    $account = $this->container->get('current_user');
    return $method->invoke($block, $account);
  }

  /**
   * Tests block access logic for various scenarios.
   */
  public function testBlockAccess(): void {
    // Forbidden when KoRe page is not configured.
    $this->assertTrue($this->getBlockAccess()->isForbidden());

    $node = Node::create(['type' => 'page', 'title' => 'KoRe Search']);
    $node->save();
    $otherNode = Node::create(['type' => 'page', 'title' => 'Other']);
    $otherNode->save();
    $this->setKoreSearchPageNode((int) $node->id());

    // Use a variable so we can change the return value between assertions.
    $currentNode = NULL;
    $this->routeMatch->method('getParameter')
      ->with('node')
      ->willReturnCallback(function () use (&$currentNode) {
        return $currentNode;
      });

    // Forbidden when not on a node route.
    $this->assertTrue($this->getBlockAccess()->isForbidden());

    // Allowed on the configured KoRe search page.
    $currentNode = $node;
    $this->assertTrue($this->getBlockAccess()->isAllowed());

    // Forbidden on a different node.
    $currentNode = $otherNode;
    $this->assertTrue($this->getBlockAccess()->isForbidden());
  }

  /**
   * Tests the block build output with configured fields and settings.
   */
  public function testBuild(): void {
    new Settings(['elasticsearch_proxy_url' => 'https://elastic.example.com']);

    $this->installEntitySchema('paragraph');

    FieldStorageConfig::create([
      'field_name' => 'field_kore_type',
      'entity_type' => 'paragraph',
      'type' => 'list_string',
      'settings' => [
        'allowed_values' => [
          'school' => 'School',
          'kindergarten' => 'Kindergarten',
        ],
      ],
    ])->save();

    FieldStorageConfig::create([
      'field_name' => 'field_kore_language',
      'entity_type' => 'paragraph',
      'type' => 'list_string',
      'settings' => [
        'allowed_values' => [
          'fi' => 'Finnish',
          'sv' => 'Swedish',
        ],
      ],
    ])->save();

    $this->config('helhist_search.settings')
      ->set('mapping_mode', 'geo')
      ->save();

    $block = $this->createBlock();
    $build = $block->build();

    $this->assertEquals('kore_react_search', $build['#theme']);
    $this->assertEquals('https://elastic.example.com', $build['#ELASTIC_PROXY_URL']);

    $settings = $build['#attached']['drupalSettings']['koreSearch'];
    $this->assertEquals([
      ['value' => 'kindergarten', 'label' => 'Kindergarten'],
      ['value' => 'school', 'label' => 'School'],
    ], $settings['typeOptions']);
    $this->assertEquals([
      ['value' => 'fi', 'label' => 'Finnish'],
      ['value' => 'sv', 'label' => 'Swedish'],
    ], $settings['languageOptions']);
    $this->assertEquals('geo', $settings['mappingMode']);

    $this->assertContains('hdbt_subtheme/kore-search-app', $build['#attached']['library']);
    $this->assertContains('config:field.storage.paragraph.field_kore_type', $build['#cache']['tags']);
    $this->assertContains('config:field.storage.paragraph.field_kore_language', $build['#cache']['tags']);
    $this->assertContains('config:helhist_search.settings', $build['#cache']['tags']);
  }

}

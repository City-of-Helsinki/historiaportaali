<?php

declare(strict_types=1);

namespace Drupal\Tests\helhist_search\Kernel\Plugin\Block;

use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\KernelTests\KernelTestBase;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * Tests the HeaderSearchBlock.
 */
#[Group('helhist_search')]
#[RunTestsInSeparateProcesses]
class HeaderSearchBlockTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    'user',
    'node',
    'field',
    'text',
    'helhist_search',
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
   * Tests build output and search page omission.
   */
  public function testBuild(): void {
    $searchNode = Node::create(['type' => 'page', 'title' => 'Search']);
    $searchNode->save();

    $this->config('helhist_search.settings')
      ->set('search_page_node', $searchNode->id())
      ->save();

    $currentNode = NULL;
    $this->routeMatch->method('getParameter')
      ->with('node')
      ->willReturnCallback(function () use (&$currentNode) {
        return $currentNode;
      });

    /** @var \Drupal\Core\Block\BlockManagerInterface $blockManager */
    $blockManager = $this->container->get('plugin.manager.block');
    $build = $blockManager->createInstance('helhist_search_header_search_block')->build();

    // Not on a node route — renders the form.
    $this->assertEquals('header_search', $build['#theme']);
    $this->assertArrayHasKey('#form', $build);

    // On the search page node — returns empty.
    $currentNode = $searchNode;
    $build = $blockManager->createInstance('helhist_search_header_search_block')->build();
    $this->assertEmpty($build);
  }

}

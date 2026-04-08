<?php

declare(strict_types=1);

namespace Drupal\Tests\helhist_media_usage\Kernel\Plugin\Block;

use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\entity_usage\EntityUsageInterface;
use Drupal\KernelTests\KernelTestBase;
use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\media\Entity\Media;
use Drupal\media\Entity\MediaType;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * Tests the MediaUsageBlock.
 */
#[Group('helhist_media_usage')]
#[RunTestsInSeparateProcesses]
class MediaUsageBlockTest extends KernelTestBase {

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
    'image',
    'media',
    'path_alias',
    'language',
    'entity_usage',
    'helhist_media_usage',
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
    $this->installEntitySchema('media');
    $this->installEntitySchema('file');
    $this->installEntitySchema('path_alias');
    $this->installSchema('file', ['file_usage']);
    $this->installSchema('entity_usage', ['entity_usage']);
    $this->installConfig(['language']);

    // Add a second language so URL prefix negotiation activates.
    ConfigurableLanguage::createFromLangcode('fi')->save();

    // Configure URL-based language negotiation with prefixes.
    $this->config('language.negotiation')
      ->set('url.prefixes', ['en' => 'en', 'fi' => 'fi'])
      ->set('url.source', 'path_prefix')
      ->save();
    $this->config('language.types')
      ->set('negotiation.language_interface.enabled', [
        'language-url' => 0,
        'language-selected' => 12,
      ])
      ->save();

    $this->container->get('kernel')->rebuildContainer();
    $this->container->get('router.builder')->rebuild();

    NodeType::create(['type' => 'article', 'name' => 'Article'])->save();
    NodeType::create(['type' => 'page', 'name' => 'Page'])->save();

    $this->installConfig(['media']);
    $mediaType = MediaType::create([
      'id' => 'image',
      'label' => 'Image',
      'source' => 'image',
      'source_configuration' => ['source_field' => 'field_media_image'],
    ]);
    $mediaType->save();
    $source = $mediaType->getSource();
    $source_field = $source->createSourceField($mediaType);
    /** @var \Drupal\field\FieldStorageConfigInterface $storage_definition */
    $storage_definition = $source_field->getFieldStorageDefinition();
    $storage_definition->save();
    $source_field->save();

    // Grant node access so the controller generates Link objects.
    $this->installConfig(['user']);
    user_role_grant_permissions('anonymous', [
      'access content',
      'view media',
    ]);

    $this->routeMatch = $this->createMock(RouteMatchInterface::class);
    $this->container->set('current_route_match', $this->routeMatch);
  }

  /**
   * Registers a usage record for a node referencing a media entity.
   */
  protected function registerUsage(Node $node, Media $media, string $field_name = 'field_media'): void {
    $entityUsage = $this->container->get(EntityUsageInterface::class);
    $entityUsage->registerUsage(
      (int) $media->id(),
      'media',
      (int) $node->id(),
      'node',
      $node->language()->getId(),
      (int) $node->getRevisionId(),
      'entity_reference',
      $field_name,
    );
  }

  /**
   * Tests build filters to articles only and deduplicates node IDs.
   */
  public function testBuild(): void {
    $article1 = Node::create(['type' => 'article', 'title' => 'Article 1']);
    $article1->save();
    $article2 = Node::create(['type' => 'article', 'title' => 'Article 2']);
    $article2->save();
    $page = Node::create(['type' => 'page', 'title' => 'A page']);
    $page->save();

    $media = Media::create([
      'bundle' => 'image',
      'name' => 'Test image',
    ]);
    $media->save();

    $this->registerUsage($article1, $media);
    // Article 2 referenced from two different fields — should appear once.
    $this->registerUsage($article2, $media, 'field_media');
    $this->registerUsage($article2, $media, 'field_liftup_image');
    $this->registerUsage($page, $media);

    $this->routeMatch->method('getParameter')
      ->with('media')
      ->willReturn($media);

    /** @var \Drupal\Core\Block\BlockManagerInterface $blockManager */
    $blockManager = $this->container->get('plugin.manager.block');
    $build = $blockManager->createInstance('helhist_media_usage_block')->build();

    $this->assertEquals('media_usage_block', $build['#theme']);
    $this->assertCount(2, $build['#content']);
    $this->assertContains($article1->id(), $build['#content']);
    $this->assertContains($article2->id(), $build['#content']);
    $this->assertNotContains($page->id(), $build['#content']);
    $this->assertEquals(0, $build['#cache']['max-age']);
  }

}

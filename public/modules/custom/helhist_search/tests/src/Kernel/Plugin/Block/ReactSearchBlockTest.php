<?php

declare(strict_types=1);

namespace Drupal\Tests\helhist_search\Kernel\Plugin\Block;

use Drupal\Core\Block\BlockPluginInterface;
use Drupal\helfi_api_base\Environment\EnvironmentEnum;
use Drupal\helfi_api_base\Environment\Project;
use Drupal\KernelTests\KernelTestBase;
use Drupal\Tests\helfi_api_base\Traits\EnvironmentResolverTrait;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;

/**
 * Tests the ReactSearchBlock.
 */
#[Group('helhist_search')]
#[RunTestsInSeparateProcesses]
class ReactSearchBlockTest extends KernelTestBase {

  use EnvironmentResolverTrait;

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
    'helfi_api_base',
    'diff',
  ];

  /**
   * Tests that the build output contains the Elastic proxy URL.
   */
  public function testBuild(): void {
    $this->setActiveProject(Project::HISTORIA, EnvironmentEnum::Local);

    $build = $this->createBlock()->build();

    $this->assertEquals('react_search', $build['#theme']);
    $this->assertEquals('https://elastic-proxy-historiaportaali.docker.so', $build['#ELASTIC_PROXY_URL']);
    $this->assertContains('hdbt_subtheme/react-search-app', $build['#attached']['library']);
    $this->assertContains('config:helfi_api_base.environment_resolver.settings', $build['#cache']['tags']);
  }

  /**
   * Tests that the URL is empty when the environment can't be resolved.
   */
  public function testBuildWithoutEnvironment(): void {
    $build = $this->createBlock()->build();

    $this->assertSame('', $build['#ELASTIC_PROXY_URL']);
  }

  /**
   * Creates the block plugin.
   */
  private function createBlock(): BlockPluginInterface {
    /** @var \Drupal\Core\Block\BlockManagerInterface $blockManager */
    $blockManager = $this->container->get('plugin.manager.block');
    $block = $blockManager->createInstance('helhist_search_react_search_block');
    assert($block instanceof BlockPluginInterface);
    return $block;
  }

}

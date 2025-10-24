<?php

declare(strict_types=1);

namespace Drupal\helhist_media_usage\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\DependencyInjection\ClassResolverInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Link;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\node\Entity\Node;
use Drupal\path_alias\AliasManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a Media Usage block.
 *
 * @Block(
 *   id = "helhist_media_usage_block",
 *   admin_label = @Translation("HelHist Media Usage"),
 *   category = @Translation("HelHist")
 * )
 */
class MediaUsageBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Class Resolver service.
   *
   * @var \Drupal\Core\DependencyInjection\ClassResolverInterface
   */
  protected $classResolver;

  /**
   * The current route match.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatch;

  /**
   * The language manager service.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * Path alias manager.
   *
   * @var \Drupal\path_alias\AliasManagerInterface
   */
  protected $pathAliasManager;

  /**
   * Constructs a new ControllerBlock object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param string $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\DependencyInjection\ClassResolverInterface $class_resolver
   *   The class resolver service.
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_match
   *   The route match service.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager service.
   * @param \Drupal\path_alias\AliasManagerInterface $path_alias_manager
   *   The path alias manager service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    ClassResolverInterface $class_resolver,
    RouteMatchInterface $route_match,
    LanguageManagerInterface $language_manager,
    AliasManagerInterface $path_alias_manager
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->classResolver = $class_resolver;
    $this->routeMatch = $route_match;
    $this->languageManager = $language_manager;
    $this->pathAliasManager = $path_alias_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('class_resolver'),
      $container->get('current_route_match'),
      $container->get('language_manager'),
      $container->get('path_alias.manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $media = $this->routeMatch->getParameter('media');

    $controller = $this->classResolver->getInstanceFromDefinition('\Drupal\entity_usage\Controller\ListUsageController');
    $data = $controller->listUsagePage('media', $media->id());

    // Get entity usage table rows from output.
    $rows = $data[0]['#rows'];
    $content = [];

    foreach ($rows as $row) {
      // Get link from entity usage table column.
      $link = $row[0];
      if ($link instanceof Link) {
        // Get node from link url.
        $url = $link->getUrl()->toString();
        // Strip langcode.
        $url = substr($url, 3);
        $language = $this->languageManager->getCurrentLanguage()->getId();
        $url_path = $this->pathAliasManager->getPathByAlias($url, $language);
        // If alias exists, we can extract node ID from path.
        if (preg_match('/node\/(\d+)/', $url_path, $matches)) {
          $node = Node::load($matches[1]);
        }
        if (isset($node)) {
          // Filter duplicates (old revisions, same media in liftup and
          // content) and non-articles.
          if (!in_array($node->id(), $content) && $node->getType() == 'article') {
            $content[] = $node->id();
          }
        }
      }
    }

    return [
      '#theme' => 'media_usage_block',
      '#content' => $content,
      '#cache' => [
        'max-age' => 0,
      ],
    ];
  }

}

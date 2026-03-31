<?php

declare(strict_types=1);

namespace Drupal\helhist_media_usage\Plugin\Block;

use Drupal\Core\Block\Attribute\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\DependencyInjection\ClassResolverInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Link;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\entity_usage\Controller\ListUsageController;
use Drupal\path_alias\AliasManagerInterface;

/**
 * Provides a Media Usage block.
 *
 * @phpstan-consistent-constructor
 */
#[Block(
  id: 'helhist_media_usage_block',
  admin_label: new TranslatableMarkup('HelHist Media Usage'),
  category: new TranslatableMarkup('HelHist')
)]
class MediaUsageBlock extends BlockBase implements ContainerFactoryPluginInterface {

  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    protected ClassResolverInterface $classResolver,
    protected RouteMatchInterface $routeMatch,
    protected LanguageManagerInterface $languageManager,
    protected AliasManagerInterface $pathAliasManager,
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $media = $this->routeMatch->getParameter('media');

    $controller = $this->classResolver->getInstanceFromDefinition(ListUsageController::class);
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
          $node = $this->entityTypeManager->getStorage('node')->load($matches[1]);
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

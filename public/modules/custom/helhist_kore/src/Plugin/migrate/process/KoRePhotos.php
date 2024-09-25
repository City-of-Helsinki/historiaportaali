<?php

namespace Drupal\helhist_kore\Plugin\migrate\process;

use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\media\Entity\Media;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;
use Drupal\paragraphs\Entity\Paragraph;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @MigrateProcessPlugin(
 *   id = "kore_photos",
 *   handle_multiples = TRUE
 * )
 */
class KoRePhotos extends ProcessPluginBase implements ContainerFactoryPluginInterface {

  /**
   * Logger service.
   *
   * @var \Drupal\Core\Logger\LoggerChannelFactoryInterface
   */
  protected $logger;

  /**
   * Constructs a plugin.
   *
   * @param array $configuration
   *   The plugin configuration.
   * @param string $plugin_id
   *   The plugin ID.
   * @param mixed $plugin_definition
   *   The plugin definition.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $logger
   *   The logger service.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, LoggerChannelFactoryInterface $logger) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->logger = $logger->get('kore_schools');
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('logger.factory')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {

    $media = [];

    if (isset($value)) {
      foreach ($value as $item) {
        foreach ($item['building']['photos'] as $photo) {
          $media[] = $this->createMediaItem($photo);
        }
      }
    }

    return $media;
  }

  /**
   * {@inheritdoc}
   */
  public function multiple(): bool {
    return TRUE;
  }

  protected function createMediaItem(array $item): array {

    if (!$image_data = file_get_contents($item['url'])) {
      return [];
    }

    // Get Finna metadata
    if(str_starts_with($item['url'], 'https://hkm.finna.fi/Cover/Show?id=')) {
      $finna_url = str_replace('https://hkm.finna.fi/Cover/Show?id=', 'https://api.finna.fi/v1/record?id=', $item['url']);
      $finna_json = file_get_contents($finna_url);
      $finna_json = json_decode($finna_json);
    }
    elseif(str_starts_with($item['url'], 'https://www.finna.fi/Cover/Show?id=')) {
      $finna_url = str_replace('https://www.finna.fi/Cover/Show?id=', 'https://api.finna.fi/v1/record?id=', $item['url']);
      $finna_json = file_get_contents($finna_url);
      $finna_json = json_decode($finna_json);
    }

    if (!isset($finna_json->records)) {
      return [];
    }

    $file_repository = \Drupal::service('file.repository');
    $image = $file_repository->writeData($image_data, 'public://' . $item['id'] . '.jpg', FileSystemInterface::EXISTS_REPLACE);

    $image_media = \Drupal::entityQuery('media')
                   ->accessCheck(FALSE)
                   ->condition('bundle', 'kore_image')
                   ->condition('name', $item['id'])
                   ->execute();

    if (!empty($image_media)) {
      foreach($image_media as $mid) {
        $image_media = Media::load($mid);
      }
    }
    else {
      $image_media = Media::create([
        'name' => $item['id'],
        'bundle' => 'kore_image',
        'uid' => 1,
        'langcode' => 'fi',
        'status' => 1,
        'field_media_image' => [
          'target_id' => $image->id(),
          'alt' => $finna_json->records[0]->title,
        ],
        'field_finna_id' => $finna_json->records[0]->id,
        'field_photographer' => $finna_json->records[0]->nonPresenterAuthors[0]->name,
      ]);
      $image_media->save();
    }

    return [
      'target_id' => $image_media->id(),
      'target_revision_id' => $image_media->getRevisionId(),
    ];
  }

}

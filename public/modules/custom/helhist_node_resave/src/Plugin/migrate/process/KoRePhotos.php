<?php

namespace Drupal\helhist_node_resave\Plugin\migrate\process;

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

    $paragraphs = [];

    $value = array_merge($value[0], $value[1]);

    if (isset($value)) {
      foreach ($value as $item) {
        $paragraphs[] = $this->createParagraphsItem($item);
      }
    }

    return $paragraphs;
  }

  /**
   * {@inheritdoc}
   */
  public function multiple(): bool {
    return TRUE;
  }

  protected function createParagraphsItem(array $item): array {

    $image_data = file_get_contents('https://gorannikolovski.com/themes/custom/gn2021/images/goran-nikolovski-signature.png');
    $file_repository = \Drupal::service('file.repository');
    $image = $file_repository->writeData($image_data, "public://goran-nikolovski-signature.png", FileSystemInterface::EXISTS_REPLACE);
    
    $image_media = Media::create([
      'name' => 'My media name',
      'bundle' => 'image',
      'uid' => 1,
      'langcode' => 'en',
      'status' => 0,
      'field_media_image' => [
        'target_id' => $image->id(),
        'alt' => t('My media alt attribute'),
        'title' => t('My media title attribute'),
      ],
      'field_author' => 'Goran Nikolovski',
      'field_date' => '2025-12-31T23:59:59',
      'field_location' => 'Subotica',
     ]);
    $image_media->save();

    return [
      'target_id' => $image_media->id(),
      'target_revision_id' => $image_media->getRevisionId(),
    ];
  }

}

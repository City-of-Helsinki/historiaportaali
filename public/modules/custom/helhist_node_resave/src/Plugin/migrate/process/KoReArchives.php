<?php

namespace Drupal\helhist_node_resave\Plugin\migrate\process;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;
use Drupal\paragraphs\Entity\Paragraph;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @MigrateProcessPlugin(
 *   id = "kore_archives",
 *   handle_multiples = TRUE
 * )
 */
class KoReArchives extends ProcessPluginBase implements ContainerFactoryPluginInterface {

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

    if (isset($value)) {
      uasort($value, [$this, 'compare']);
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

  /**
   * {@inheritdoc}
   */
  protected function compare($a, $b) {
    $ac = $a['begin_year'];
    $bc = $b['begin_year'];
    return ($ac < $bc) ? -1 : 1;
  }

  protected function createParagraphsItem(array $item): array {

    if ($item['begin_year']) {
      $date = '1.1.' . $item['begin_year'];
    }

    if ($item['end_year']) {
      $end_date = '1.1.' . $item['end_year'];
    }

    $paragraph = Paragraph::create([
      'langcode' => 'fi',
      'field_kore_date' => [
        'value' => isset($date) ? date(DateTimeItemInterface::DATE_STORAGE_FORMAT, strtotime($date)) : NULL,
        'end_value' => isset($end_date) ? date(DateTimeItemInterface::DATE_STORAGE_FORMAT, strtotime($end_date)) : NULL,
      ],

      // Unique to this KoRe paragraph type.
      'type' => 'kore_archive',
      'field_kore_archive' => [
        'value' => $item['location'],
      ],
    ]);

    $paragraph->save();

    return [
      'target_id' => $paragraph->id(),
      'target_revision_id' => $paragraph->getRevisionId(),
    ];
  }

}

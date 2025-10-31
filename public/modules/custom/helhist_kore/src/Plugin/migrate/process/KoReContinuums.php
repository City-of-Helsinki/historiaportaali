<?php

declare(strict_types=1);

namespace Drupal\helhist_kore\Plugin\migrate\process;

use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;
use Drupal\paragraphs\Entity\Paragraph;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Processes KoRe continuum data for migration.
 *
 * @MigrateProcessPlugin(
 *   id = "kore_continuums",
 *   handle_multiples = TRUE
 * )
 *
 * @phpstan-consistent-constructor
 */
class KoReContinuums extends ProcessPluginBase implements ContainerFactoryPluginInterface {

  /**
   * Logger service.
   *
   * @var \Drupal\Core\Logger\LoggerChannelInterface
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

    if (!empty($value)) {
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
    $ac = $a['year'];
    $bc = $b['year'];
    return ($ac > $bc) ? -1 : 1;
  }

  /**
   * Creates a paragraph item for continuum data.
   *
   * @param array $item
   *   The item data array.
   *
   * @return array
   *   The paragraph reference array.
   */
  protected function createParagraphsItem(array $item): array {

    if ($item['year']) {
      $date = (($item['day']) ? $item['day'] : '1') . '.' . (($item['month']) ? $item['month'] : '1') . '.' . $item['year'];
    }

    $paragraph = Paragraph::create([
      'langcode' => 'fi',
      'field_kore_start_year' => [
        'value' => isset($date) ? date(DateTimeItemInterface::DATE_STORAGE_FORMAT, strtotime($date)) : NULL,
      ],

      // Unique to this KoRe paragraph type.
      'type' => 'kore_continuum',
      'field_kore_continuum' => [
        'value' => str_replace(' ', '_', $item['description']),
      ],
    ]);

    if (is_array($item['target_school'])) {
      // @phpstan-ignore-next-line
      $school_node = \Drupal::entityQuery('node')
        ->accessCheck(FALSE)
        ->condition('type', 'kore_school')
        ->condition('field_kore_id', $item['target_school']['id'])
        ->execute();
    }
    elseif (is_array($item['active_school'])) {
      // @phpstan-ignore-next-line
      $school_node = \Drupal::entityQuery('node')
        ->accessCheck(FALSE)
        ->condition('type', 'kore_school')
        ->condition('field_kore_id', $item['active_school']['id'])
        ->execute();
    }

    if (isset($school_node)) {
      $paragraph->set('field_kore_school', $school_node);
    }

    $paragraph->save();

    return [
      'target_id' => $paragraph->id(),
      'target_revision_id' => $paragraph->getRevisionId(),
    ];
  }

}

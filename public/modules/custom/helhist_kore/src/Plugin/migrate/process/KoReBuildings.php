<?php

declare(strict_types=1);

namespace Drupal\helhist_kore\Plugin\migrate\process;

use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;
use Drupal\paragraphs\Entity\Paragraph;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Processes KoRe building data for migration.
 *
 * @MigrateProcessPlugin(
 *   id = "kore_buildings",
 *   handle_multiples = TRUE
 * )
 *
 * @phpstan-consistent-constructor
 */
class KoReBuildings extends ProcessPluginBase implements ContainerFactoryPluginInterface {

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
    return ($ac > $bc) ? -1 : 1;
  }

  /**
   * Creates a paragraph item for building data.
   *
   * @param array $item
   *   The item data array.
   *
   * @return array
   *   The paragraph reference array.
   */
  protected function createParagraphsItem(array $item): array {

    $paragraph = Paragraph::create([
      'langcode' => 'fi',
      'field_kore_start_year' => [
        'value' => $item['begin_year'] ? $item['begin_year'] : NULL,
      ],
      'field_kore_end_year' => [
        'value' => $item['end_year'] ? $item['end_year'] : NULL,
      ],

      // Unique to this KoRe paragraph type.
      'type' => 'kore_building',
    ]);

    // Create nested Address paragraphs.
    if (empty($item['building']['addresses'])) {
      $address_para = Paragraph::create([
        'langcode' => 'fi',
        'field_kore_address' => [
          'value' => 'Osoite tuntematon',
        ],
        'type' => 'kore_address',
      ]);

      $address_para->save();

      $paragraph->field_kore_addresses->appendItem($address_para);
    }

    foreach ($item['building']['addresses'] as $address) {
      $address_para = Paragraph::create([
        'langcode' => 'fi',
        'field_kore_address' => [
          'value' => $address['street_name_fi'],
        ],
        'type' => 'kore_address',
      ]);

      if (is_array($address['location'])) {
        $address_para->set('field_kore_geofield', "POINT (" . $address['location']['coordinates'][0] . " " . $address['location']['coordinates'][1] . ")");
      }

      $address_para->save();

      $paragraph->field_kore_addresses->appendItem($address_para);
    }

    $paragraph->save();

    return [
      'target_id' => $paragraph->id(),
      'target_revision_id' => $paragraph->getRevisionId(),
    ];
  }

}

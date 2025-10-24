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
 * Provides a plugin for migrating KoRe genders.
 *
 * @MigrateProcessPlugin(
 *   id = "kore_genders",
 *   handle_multiples = TRUE
 * )
 */
class KoReGenders extends ProcessPluginBase implements ContainerFactoryPluginInterface {

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
    return ($ac > $bc) ? -1 : 1;
  }

  /**
   * Creates a paragraphs item.
   */
  protected function createParagraphsItem(array $item): array {

    $item['gender'] = str_replace(['-', ' '], '_', $item['gender']);
    $item['gender'] = str_replace(['ä', 'ö'], ['a', 'o'], $item['gender']);

    $paragraph = Paragraph::create([
      'langcode' => 'fi',
      'field_kore_start_year' => [
        'value' => $item['begin_year'] ? $item['begin_year'] : NULL,
      ],
      'field_kore_end_year' => [
        'value' => $item['end_year'] ? $item['end_year'] : NULL,
      ],

      // Unique to this KoRe paragraph type.
      'type' => 'kore_gender',
      'field_kore_gender' => [
        'value' => $item['gender'],
      ],
    ]);

    $paragraph->save();

    return [
      'target_id' => $paragraph->id(),
      'target_revision_id' => $paragraph->getRevisionId(),
    ];
  }

}

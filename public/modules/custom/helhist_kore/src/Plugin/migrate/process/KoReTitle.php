<?php

declare(strict_types=1);

namespace Drupal\helhist_kore\Plugin\migrate\process;

use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Processes KoRe title data for migration.
 *
 * @MigrateProcessPlugin(
 *   id = "kore_title",
 *   handle_multiples = TRUE
 * )
 *
 * @phpstan-consistent-constructor
 */
class KoReTitle extends ProcessPluginBase implements ContainerFactoryPluginInterface {

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

    if (isset($value) && is_array($value)) {
      uasort($value, [$this, 'compare']);
      $latest = current($value);

      if (is_array($latest) && !empty($latest['official_name'])) {
        return $latest['official_name'];
      }
      elseif (is_array($latest['other_names']) && !empty($latest['other_names'][0]['value'])) {
        return $latest['other_names'][0]['value'];
      }
    }

    return "NULL TITLE";
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

}

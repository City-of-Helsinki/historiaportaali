<?php

declare(strict_types=1);

namespace Drupal\helhist_kore_search;

use Drupal\Core\Config\ConfigFactoryInterface;

/**
 * Provides KoRe search filter options from field storage config.
 */
class KoreSearchOptionsProvider {

  /**
   * The config factory.
   */
  protected ConfigFactoryInterface $configFactory;

  /**
   * Constructs a KoreSearchOptionsProvider object.
   */
  public function __construct(ConfigFactoryInterface $config_factory) {
    $this->configFactory = $config_factory;
  }

  /**
   * Extract values with labels from a list_string field storage config.
   *
   * @param string $config_name
   *   The configuration ID.
   * @param bool $alphabetical_sort
   *   Whether to sort the options alphabetically.
   *
   * @return array<int, array{value: string, label: string}>
   *   Array of {value, label} in requested order.
   */
  public function getAllowedValuesWithLabels(string $config_name, $alphabetical_sort = FALSE): array {
    $config = $this->configFactory->get($config_name);
    $allowed = $config->get('settings.allowed_values') ?? [];
    if (!is_array($allowed)) {
      return [];
    }
    $options = [];
    foreach ($allowed as $item) {
      if (is_array($item) && isset($item['value'])) {
        $options[] = [
          'value' => $item['value'],
          'label' => $item['label'] ?? $item['value'],
        ];
      }
    }

    if ($alphabetical_sort) {
      usort($options, fn(array $a, array $b) => strcasecmp($a['label'], $b['label']));
    }

    return $options;
  }

}

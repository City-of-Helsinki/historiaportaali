<?php

declare(strict_types=1);

namespace Drupal\helhist_kore_search\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\helfi_api_base\Environment\ActiveServiceTrait;
use Drupal\helfi_api_base\Environment\EnvironmentResolverInterface;

/**
 * Hooks for the KoRe React search.
 */
final class KoreSearchHooks {

  use ActiveServiceTrait;

  public function __construct(
    protected readonly EnvironmentResolverInterface $environmentResolver,
  ) {
  }

  /**
   * Implements hook_preprocess_HOOK() for kore_react_search.
   *
   * @param array<string, mixed> $variables
   *   The template variables.
   */
  #[Hook('preprocess_kore_react_search')]
  public function preprocessKoreReactSearch(array &$variables): void {
    $variables['ELASTIC_PROXY_URL'] = $variables['ELASTIC_PROXY_URL']
      ?? $this->getPublicElasticProxy()?->getAddress()
      ?? '';
  }

}

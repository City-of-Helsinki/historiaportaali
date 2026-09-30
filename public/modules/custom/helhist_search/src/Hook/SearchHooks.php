<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\helfi_api_base\Environment\ActiveServiceTrait;
use Drupal\helfi_api_base\Environment\EnvironmentResolverInterface;

/**
 * Hooks for the React search.
 */
final class SearchHooks {

  use ActiveServiceTrait;

  public function __construct(
    protected readonly EnvironmentResolverInterface $environmentResolver,
  ) {
  }

  /**
   * Implements hook_preprocess_HOOK() for react_search.
   *
   * @param array<string, mixed> $variables
   *   The template variables.
   */
  #[Hook('preprocess_react_search')]
  public function preprocessReactSearch(array &$variables): void {
    $variables['ELASTIC_PROXY_URL'] = $this->getPublicElasticProxy()?->getAddress() ?? '';
  }

}

<?php

declare(strict_types=1);

namespace Drupal\helhist_search\EventSubscriber;

use Drupal\csp\Event\PolicyAlterEvent;
use Drupal\helfi_api_base\Environment\ActiveServiceTrait;
use Drupal\helfi_platform_config\EventSubscriber\CspSubscriberBase;

/**
 * Add Elasticsearch proxy URL to CSP connect-src.
 */
final class CspElasticProxySubscriber extends CspSubscriberBase {

  use ActiveServiceTrait;

  /**
   * Alter CSP policies.
   *
   * @param \Drupal\csp\Event\PolicyAlterEvent $event
   *   The policy alter event.
   */
  public function policyAlter(PolicyAlterEvent $event): void {
    $policy = $event->getPolicy();
    if ($proxy = $this->getPublicElasticProxy()) {
      $policy->fallbackAwareAppendIfEnabled('connect-src', [$proxy->getAddress()]);
    }
  }

}

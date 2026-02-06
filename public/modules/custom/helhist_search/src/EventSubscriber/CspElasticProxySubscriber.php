<?php

declare(strict_types=1);

namespace Drupal\helhist_search\EventSubscriber;

use Drupal\Core\Site\Settings;
use Drupal\csp\Event\PolicyAlterEvent;
use Drupal\helfi_platform_config\EventSubscriber\CspSubscriberBase;

/**
 * Add Elasticsearch proxy URL to CSP connect-src.
 */
final class CspElasticProxySubscriber extends CspSubscriberBase {

  /**
   * Alter CSP policies.
   *
   * @param \Drupal\csp\Event\PolicyAlterEvent $event
   *   The policy alter event.
   */
  public function policyAlter(PolicyAlterEvent $event): void {
    $policy = $event->getPolicy();
    $proxy_url = Settings::get('elasticsearch_proxy_url');
    if ($proxy_url) {
      $policy->fallbackAwareAppendIfEnabled('connect-src', [$proxy_url]);
    }
  }

}

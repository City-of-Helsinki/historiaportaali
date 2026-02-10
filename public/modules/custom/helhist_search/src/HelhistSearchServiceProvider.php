<?php

declare(strict_types=1);

namespace Drupal\helhist_search;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;
use Drupal\helfi_platform_config\HelfiPlatformConfigServiceProvider;
use Drupal\helhist_search\EventSubscriber\CspElasticProxySubscriber;

/**
 * Service provider for HelHist search.
 */
final class HelhistSearchServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritdoc}
   */
  public function register(ContainerBuilder $container): void {
    HelfiPlatformConfigServiceProvider::registerCspEventSubscribers($container, [
      CspElasticProxySubscriber::class,
    ]);
  }

}

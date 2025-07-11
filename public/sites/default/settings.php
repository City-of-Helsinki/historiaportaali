<?php

use Symfony\Component\HttpFoundation\Request;

if (PHP_SAPI === 'cli') {
  ini_set('memory_limit', '1024M');
}
else {
  // New relic triggers garbage collector which adds extra time on the request.
  // The gc enabled is useful for migration drush commands and probably others.
  // For non cli requests, there should not be a case where gc is called / needed.
  ini_set('zend.enable_gc', 'Off');
}


if (!function_exists('drupal_get_env')) {
  /**
   * Gets the value of given environment variable.
   *
   * @param string|array $variables
   *   The variables to scan.
   *
   * @return mixed
   *   The value.
   */
  function drupal_get_env(string|array $variables) : mixed {
    if (!is_array($variables)) {
      $variables = [$variables];
    }

    foreach ($variables as $var) {
      if ($value = getenv($var)) {
        return $value;
      }
    }
    return NULL;
  }
}

if ($simpletest_db = getenv('SIMPLETEST_DB')) {
  $parts = parse_url($simpletest_db);
  putenv(sprintf('DRUPAL_DB_NAME=%s', substr($parts['path'], 1)));
  putenv(sprintf('DRUPAL_DB_USER=%s', $parts['user']));
  putenv(sprintf('DRUPAL_DB_PASS=%s', $parts['pass']));
  putenv(sprintf('DRUPAL_DB_HOST=%s', $parts['host']));
}

$databases['default']['default'] = [
  'database' => getenv('DRUPAL_DB_NAME'),
  'username' => getenv('DRUPAL_DB_USER'),
  'password' => getenv('DRUPAL_DB_PASS'),
  'prefix' => '',
  'host' => getenv('DRUPAL_DB_HOST'),
  'port' => getenv('DRUPAL_DB_PORT') ?: 3306,
  'namespace' => 'Drupal\Core\Database\Driver\mysql',
  'driver' => 'mysql',
  'charset' => 'utf8mb4',
  'collation' => 'utf8mb4_swedish_ci',
  'init_commands' => [
    'isolation_level' => 'SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED',
  ],
];

$settings['hash_salt'] = getenv('DRUPAL_HASH_SALT') ?: '000';

$config['key.key.tfa']['key_provider_settings']['key_value'] = getenv('TFA_ENCRYPTION_KEY');

// Only in Wodby environment.
// @see https://wodby.com/docs/stacks/drupal/#overriding-settings-from-wodbysettingsphp
if (isset($_SERVER['WODBY_APP_NAME'])) {
  // The include won't be added automatically if it's already there.
  // phpcs:ignore
  include_once '/var/www/conf/wodby.settings.php'; // NOSONAR
}

$config['scheduler.settings']['lightweight_cron_access_key'] = getenv('DRUPAL_SCHEDULER_CRON_KEY') ?: $settings['hash_salt'];

$config['openid_connect.client.tunnistamo']['settings']['client_id'] = getenv('TUNNISTAMO_CLIENT_ID');
$config['openid_connect.client.tunnistamo']['settings']['client_secret'] = getenv('TUNNISTAMO_CLIENT_SECRET');

if ($tunnistamo_environment_url = getenv('TUNNISTAMO_ENVIRONMENT_URL')) {
  $config['openid_connect.client.tunnistamo']['settings']['environment_url'] = $tunnistamo_environment_url;
}

$config['siteimprove.settings']['prepublish_enabled'] = TRUE;
$config['siteimprove.settings']['api_username'] = getenv('SITEIMPROVE_API_USERNAME');
$config['siteimprove.settings']['api_key'] = getenv('SITEIMPROVE_API_KEY');

$settings['matomo_site_id'] = getenv('MATOMO_SITE_ID');
$settings['siteimprove_id'] = getenv('SITEIMPROVE_ID');

$routes = [];
// Drupal route(s).
if ($drupal_routes = getenv('DRUPAL_ROUTES')) {
  $routes = array_map(fn (string $route) => trim($route), explode(',', $drupal_routes));
}
$routes[] = 'http://127.0.0.1';

if ($simpletest_base_url = getenv('SIMPLETEST_BASE_URL')) {
  $routes[] = $simpletest_base_url;
}

if ($drush_options_uri = getenv('DRUSH_OPTIONS_URI')) {
  $routes[] = $drush_options_uri;
}

foreach ($routes as $route) {
  $host = parse_url($route, PHP_URL_HOST);
  $trusted_host = str_replace('.', '\.', $host);
  $settings['trusted_host_patterns'][] = '^' . $trusted_host . '$';
}

$settings['config_sync_directory'] = '../conf/cmi';
$settings['file_public_path'] = getenv('DRUPAL_FILES_PUBLIC') ?: 'sites/default/files';
$settings['file_private_path'] = getenv('DRUPAL_FILES_PRIVATE');
$settings['file_temp_path'] = getenv('DRUPAL_TMP_PATH') ?: '/tmp';

if ($reverse_proxy_address = getenv('DRUPAL_REVERSE_PROXY_ADDRESS')) {
  $reverse_proxy_address = explode(',', $reverse_proxy_address);

  if (isset($_SERVER['REMOTE_ADDR'])) {
    $reverse_proxy_address[] = $_SERVER['REMOTE_ADDR'];
  }
  $settings['reverse_proxy'] = TRUE;
  $settings['reverse_proxy_addresses'] = $reverse_proxy_address;
  $settings['reverse_proxy_trusted_headers'] = Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_HOST | Request::HEADER_X_FORWARDED_PORT | Request::HEADER_X_FORWARDED_PROTO;
  $settings['reverse_proxy_host_header'] = 'X_FORWARDED_HOST';
}

if ($blob_storage_name = getenv('AZURE_BLOB_STORAGE_NAME')) {
  $schemes = [
    'azure' => [
      'driver' => 'helfi_azure',
      'config' => [
        'name' => $blob_storage_name,
        'key' => drupal_get_env([
          'AZURE_BLOB_STORAGE_KEY',
          'BLOBSTORAGE_ACCOUNT_KEY',
        ]),
        'token' => drupal_get_env([
          'AZURE_BLOB_STORAGE_SAS_TOKEN',
          'BLOBSTORAGE_SAS_TOKEN',
        ]),
        'container' => getenv('AZURE_BLOB_STORAGE_CONTAINER'),
        'endpointSuffix' => 'core.windows.net',
        'protocol' => 'https',
      ],
      'cache' => TRUE,
    ],
  ];
  $config['helfi_azure_fs.settings']['use_blob_storage'] = TRUE;
  $settings['flysystem'] = $schemes;
}

if ($navigation_authentication_key = getenv('DRUPAL_NAVIGATION_API_KEY')) {
  $config['helfi_navigation.api']['key'] = $navigation_authentication_key;
}

// Make sure project name and app env are defined in GitHub actions too.
if ($github_repository = getenv('GITHUB_REPOSITORY')) {
  if (!getenv('APP_ENV')) {
    putenv('APP_ENV=ci');
  }

  if (!getenv('PROJECT_NAME')) {
    putenv('PROJECT_NAME=' . $github_repository);
  }
}
$config['helfi_api_base.environment_resolver.settings']['environment_name'] = getenv('APP_ENV');
$config['helfi_api_base.environment_resolver.settings']['project_name'] = getenv('PROJECT_NAME');

if ($varnish_host = getenv('DRUPAL_VARNISH_HOST')) {
  $config['varnish_purger.settings.default']['hostname'] = $varnish_host;
  $config['varnish_purger.settings.varnish_purge_all']['hostname'] = $varnish_host;
}

if ($varnish_port = getenv('DRUPAL_VARNISH_PORT')) {
  $config['varnish_purger.settings.default']['port'] = $varnish_port;
  $config['varnish_purger.settings.varnish_purge_all']['port'] = $varnish_port;
}

// Configuration doesn't know about existing config yet, so we can't
// just append new headers to an already existing headers array here.
// If you have configured any extra headers in your purge settings,
// you must add them here as well.
$config['varnish_purger.settings.default']['headers'] = [
  [
    'field' => 'Cache-Tags',
    'value' => '[invalidation:expression]',
  ],
];
$config['varnish_purger.settings.varnish_purge_all']['headers'] = [
  [
    'field' => 'X-VC-Purge-Method',
    'value' => 'regex',
  ],
];

if ($varnish_purge_key = getenv('VARNISH_PURGE_KEY')) {
  $config['varnish_purger.settings.default']['headers'][] = [
    'field' => 'X-VC-Purge-Key',
    'value' => $varnish_purge_key,
  ];
  $config['varnish_purger.settings.varnish_purge_all']['headers'][] = [
    'field' => 'X-VC-Purge-Key',
    'value' => $varnish_purge_key,
  ];
}

if ($stage_file_proxy_origin = getenv('STAGE_FILE_PROXY_ORIGIN')) {
  $config['stage_file_proxy.settings']['origin'] = $stage_file_proxy_origin;
  $config['stage_file_proxy.settings']['origin_dir'] = getenv('STAGE_FILE_PROXY_ORIGIN_DIR') ?: 'test';
  $config['stage_file_proxy.settings']['hotlink'] = FALSE;
  $config['stage_file_proxy.settings']['use_imagecache_root'] = FALSE;
}

// Map API accounts. The value should be a base64 encoded JSON string.
// @see https://github.com/City-of-Helsinki/drupal-module-helfi-api-base/blob/main/documentation/api-accounts.md.
if ($api_accounts = getenv('DRUPAL_API_ACCOUNTS')) {
  $config['helfi_api_base.api_accounts']['accounts'] = json_decode(base64_decode($api_accounts), TRUE);
}

// Map vault accounts. The value should be a base64 encoded JSON string.
// @see https://github.com/City-of-Helsinki/drupal-module-helfi-api-base/blob/main/documentation/api-accounts.md.
if ($vault_accounts = getenv('DRUPAL_VAULT_ACCOUNTS')) {
  $config['helfi_api_base.api_accounts']['vault'] = json_decode(base64_decode($vault_accounts), TRUE);
}

// Override session suffix when present.
if ($session_suffix = getenv('DRUPAL_SESSION_SUFFIX')) {
  $config['helfi_proxy.settings']['session_suffix'] = $session_suffix;
}

if ($robots_header_enabled = getenv('DRUPAL_X_ROBOTS_TAG_HEADER')) {
  $config['helfi_proxy.settings']['robots_header_enabled'] = (bool) $robots_header_enabled;
}

$artemis_destination = drupal_get_env([
  'ARTEMIS_DESTINATION',
  'PROJECT_NAME',
]);

$artemis_brokers = getenv('ARTEMIS_BROKERS');

if ($artemis_brokers && $artemis_destination) {
  $settings['stomp']['default'] = [
    'clientId' => getenv('ARTEMIS_CLIENT_ID') ?: 'artemis',
    'login' => getenv('ARTEMIS_LOGIN') ?: NULL,
    'passcode' => getenv('ARTEMIS_PASSCODE') ?: NULL,
    'destination' => sprintf('/queue/%s', $artemis_destination),
    'brokers' => $artemis_brokers,
    'timeout' => ['read' => 12000],
    'heartbeat' => [
      'send' => 20000,
      'receive' => 0,
      'observers' => [
        [
          'class' => '\Stomp\Network\Observer\HeartbeatEmitter',
        ],
      ],
    ],
  ];
  $settings['queue_default'] = 'queue.stomp.default';
}

$config['filelog.settings']['rotation']['schedule'] = 'never';

if (
  ($redis_host = getenv('REDIS_HOST')) &&
  file_exists('modules/contrib/redis/redis.services.yml') &&
  extension_loaded('redis')
) {
  // Redis namespace is not available until redis module is enabled, so
  // we have to manually register it in order to enable the module and have
  // this configuration when the module is installed, but not yet enabled.
  $class_loader->addPsr4('Drupal\\redis\\', 'modules/contrib/redis/src');
  $redis_port = getenv('REDIS_PORT') ?: 6379;

  if ($redis_prefix = getenv('REDIS_PREFIX')) {
    $settings['cache_prefix']['default'] = $redis_prefix;
  }

  if ($redis_password = getenv('REDIS_PASSWORD')) {
    $settings['redis.connection']['password'] = $redis_password;
  }
  $settings['redis.connection']['interface'] = 'PhpRedis';
  $settings['redis.connection']['port'] = $redis_port;

  // REDIS_INSTANCE environment variable is used to support Redis sentinel.
  // REDIS_HOST value should contain host and port, like 'sentinel:5000'
  // when using Sentinel.
  if ($redis_instance = getenv('REDIS_INSTANCE')) {
    $settings['redis.connection']['instance'] = $redis_instance;
    // Sentinel expects redis host to be an array.
    $redis_host = explode(',', $redis_host);
  }
  $settings['redis.connection']['host'] = $redis_host;

  $settings['cache']['default'] = 'cache.backend.redis';
  $settings['container_yamls'][] = 'modules/contrib/redis/example.services.yml';
  // Register redis services to make sure we don't get a non-existent service
  // error while trying to enable the module.
  $settings['container_yamls'][] = 'modules/contrib/redis/redis.services.yml';
}

$settings['is_azure'] = FALSE;

// Environment specific overrides.
if (file_exists(__DIR__ . '/all.settings.php')) {
  // phpcs:ignore
  include_once __DIR__ . '/all.settings.php'; // NOSONAR
}

if ($env = getenv('APP_ENV')) {
  if (file_exists(__DIR__ . '/' . $env . '.settings.php')) {
    // phpcs:ignore
    include_once __DIR__ . '/' . $env . '.settings.php'; // NOSONAR
  }

  $servicesFiles = [
    'services.yml',
    'all.services.yml',
    $env . '.services.yml',
  ];

  foreach ($servicesFiles as $fileName) {
    if (file_exists(__DIR__ . '/' . $fileName)) {
      $settings['container_yamls'][] = __DIR__ . '/' . $fileName;
    }
  }

  if (getenv('OPENSHIFT_BUILD_NAMESPACE') && file_exists(__DIR__ . '/azure.settings.php')) {
    // phpcs:ignore
    include_once __DIR__ . '/azure.settings.php'; // NOSONAR
  }
}

/**
 * Deployment identifier.
 *
 * Default 'deployment_identifier' cache key to modified time of 'composer.lock'
 * file in case it's not already defined.
 */
if (empty($settings['deployment_identifier'])) {
  $settings['deployment_identifier'] = filemtime(__DIR__ . '/../../../composer.lock');
}

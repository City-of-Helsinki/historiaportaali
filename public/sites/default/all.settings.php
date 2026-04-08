<?php

/**
 * @file
 * Contains site specific overrides.
 */

 // Allow more memory due to indexing might be memory intensive.
if (PHP_SAPI === 'cli') {
  ini_set('memory_limit', '1024M');
}

/*
$config['openid_connect.client.tunnistamo']['settings']['ad_roles'] = [
  [
    'ad_role' => 'Drupal_Helfi_kaupunkitaso_paakayttajat',
    'roles' => ['admin'],
  ],
  [
    'ad_role' => 'Drupal_Helfi_Historia_sisallontuottajat_suppea',
    'roles' => ['admin'],
  ],
  [
    'ad_role' => 'Drupal_Helfi_Historia_sisallontuottajat_laaja',
    'roles' => ['editor'],
  ],
  [
    'ad_role' => 'Drupal_Helfi_Historia_paakayttajat',
    'roles' => ['content_producer'],
  ],
  [
    'ad_role' => '947058f4-697e-41bb-baf5-f69b49e5579a',
    'roles' => ['super_administrator'],
  ],
];
*/

if ($elastic_proxy_url = getenv('ELASTIC_PROXY_URL')) {
  $settings['elasticsearch_proxy_url'] = $elastic_proxy_url;
}

if ($es_url = getenv('ELASTICSEARCH_URL')) {
  $config['search_api.server.elasticsearch']['backend_config']['connector'] = 'helfi_connector';
  $config['search_api.server.elasticsearch']['backend_config']['connector_config']['url'] = $es_url;
  $config['search_api.server.elasticsearch']['backend_config']['connector_config']['username'] = getenv('ELASTIC_USER');
  $config['search_api.server.elasticsearch']['backend_config']['connector_config']['password'] = getenv('ELASTIC_PASSWORD');

  $config['elasticsearch_connector.cluster.local']['url'] = $es_url;
  $config['elasticsearch_connector.cluster.local']['options']['use_authentication'] = '1';
  $config['elasticsearch_connector.cluster.local']['options']['username'] = getenv('ELASTIC_USER');
  $config['elasticsearch_connector.cluster.local']['options']['password'] = getenv('ELASTIC_PASSWORD');
  // This should not be necessary
  $config['image.settings']['suppress_itok_output'] = TRUE;
  $config['image.settings']['allow_insecure_derivatives'] = TRUE;
}

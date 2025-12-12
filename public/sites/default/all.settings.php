<?php

/**
 * @file
 * Contains site specific overrides.
 */

 // Allow more memory due to indexing might be memory intensive.
if (PHP_SAPI === 'cli') {
  ini_set('memory_limit', '1024M');
}

// Elasticsearch settings.
if ($env = getenv('ELASTICSEARCH_URL')) {
  $config['search_api.server.elasticsearch']['backend_config']['connector'] = 'helfi_connector';
  $config['search_api.server.elasticsearch']['backend_config']['connector_config']['url'] = getenv('ELASTICSEARCH_URL');
  $config['search_api.server.elasticsearch']['backend_config']['connector_config']['username'] = getenv('ELASTIC_USER');
  $config['search_api.server.elasticsearch']['backend_config']['connector_config']['password'] = getenv('ELASTIC_PASSWORD');


  $config['elasticsearch_connector.cluster.local']['url'] = getenv('ELASTICSEARCH_URL');
  $config['elasticsearch_connector.cluster.local']['options']['use_authentication'] = '1';
  $config['elasticsearch_connector.cluster.local']['options']['username'] = getenv('ELASTIC_USER');
  $config['elasticsearch_connector.cluster.local']['options']['password'] = getenv('ELASTIC_PASSWORD');
  // This should not be necessary
  $config['image.settings']['suppress_itok_output'] = TRUE;
  $config['image.settings']['allow_insecure_derivatives'] = TRUE;
}

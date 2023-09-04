<?php

/**
 * @file
 * Contains site specific overrides.
 */

// Elasticsearch settings.
if ($env = getenv('ELASTICSEARCH_URL')) {
  $config['elasticsearch_connector.cluster.local']['url'] = getenv('ELASTICSEARCH_URL');
  $config['elasticsearch_connector.cluster.local']['options']['use_authentication'] = '1';
  $config['elasticsearch_connector.cluster.local']['options']['username'] = getenv('ELASTIC_USER');
  $config['elasticsearch_connector.cluster.local']['options']['password'] = getenv('ELASTIC_PASSWORD');
  // This should not be necessary
  $config['image.settings']['suppress_itok_output'] = TRUE;
  $config['image.settings']['allow_insecure_derivatives'] = TRUE;
}

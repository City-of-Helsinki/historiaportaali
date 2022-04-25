<?php

/**
 * @file
 * Contains site specific overrides.
 */

// Openshift Elasticsearch authentication
// Replace passwords with env variables or secrets, preferably
if ($env = getenv('APP_ENV')) {
  if ($env == 'development') {
    $config['elasticsearch_connector.cluster.local']['url'] = 'https://elasticsearch-helhist-dev-es-http:9200';
    $config['elasticsearch_connector.cluster.local']['options']['use_authentication'] = '1';
    $config['elasticsearch_connector.cluster.local']['options']['username'] = 'elastic';
    $config['elasticsearch_connector.cluster.local']['options']['password'] = '11U1i6GY6I1Tmr829jQLo8dY';
    // This should not be necessary
    $config['image.settings']['suppress_itok_output'] = TRUE;
    $config['image.settings']['allow_insecure_derivatives'] = TRUE;
  }
  if ($env == 'test') {
    $config['elasticsearch_connector.cluster.local']['url'] = 'https://elasticsearch-helhist-test-es-http:9200';
    $config['elasticsearch_connector.cluster.local']['options']['use_authentication'] = '1';
    $config['elasticsearch_connector.cluster.local']['options']['username'] = 'elastic';
    $config['elasticsearch_connector.cluster.local']['options']['password'] = 'Q7n88J667AHiEy7Z8J0G0ehD';
    // This should not be necessary
    $config['image.settings']['suppress_itok_output'] = TRUE;
    $config['image.settings']['allow_insecure_derivatives'] = TRUE;
  }
  if ($env == 'production') {
    $config['elasticsearch_connector.cluster.local']['url'] = 'https://elasticsearch-helhist-prod-es-http:9200';
    $config['elasticsearch_connector.cluster.local']['options']['use_authentication'] = '1';
    $config['elasticsearch_connector.cluster.local']['options']['username'] = 'elastic';
    $config['elasticsearch_connector.cluster.local']['options']['password'] = '24r4BwuWWs6809EmNk30Y2ze';
    // This should not be necessary
    $config['image.settings']['suppress_itok_output'] = TRUE;
    $config['image.settings']['allow_insecure_derivatives'] = TRUE;
  }
}

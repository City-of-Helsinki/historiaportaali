<?php

/**
 * @file
 * Contains site specific overrides.
 */

 // Allow more memory due to indexing might be memory intensive.
if (PHP_SAPI === 'cli') {
  ini_set('memory_limit', '1024M');
}

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

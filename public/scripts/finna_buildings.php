<?php

use Drupal\media\Entity\Media;
use Drupal\taxonomy\Entity\Term;

$mids = \Drupal::entityQuery('media')
  ->condition('field_finna_id', '', '<>')
  ->execute();

foreach ($mids as $mid) {
  $media = Media::load($mid);

  $finna_id = $media->field_finna_id->value;

  $url_fi = 'https://api.finna.fi/v1/record?id=' . $finna_id . '&lng=fi';
  $json_fi = file_get_contents($url_fi);
  $json_fi = json_decode($json_fi, true);

  // Check if received valid response.
  if (!empty($json_fi)) {
    if (($json_fi['status'] == 'OK')) {

    $url_sv = 'https://api.finna.fi/v1/record?id=' . $finna_id . '&lng=sv';
    $json_sv = file_get_contents($url_sv);
    $json_sv = json_decode($json_sv, true);

    $url_en = 'https://api.finna.fi/v1/record?id=' . $finna_id . '&lng=en-gb';
    $json_en = file_get_contents($url_en);
    $json_en = json_decode($json_en, true);

      // Create FI language terms first.
      foreach ($json_fi['records'] as $record) {
        foreach ($record['buildings'] as $term) {
          if (isset($term['translated'])) {
            $term_name = $term['translated'];

            $existing_term = \Drupal::entityTypeManager()
              ->getStorage('taxonomy_term')
              ->loadByProperties(['name' => $term_name, 'vid' => 'buildings']);
            $existing_term = reset($existing_term);

            // if (!$existing_term) {
            //   Term::create(['name' => $term_name, 'vid' => 'buildings'])->save();
            // }

            $source_name = $term_name;
          } else {
            echo 'https://historia.hel.fi/fi/media/' . $mid . '/edit' . PHP_EOL;
          }
        }
      }

      // Translate SV language terms using FI as source.
      foreach ($json_sv['records'] as $record) {
        foreach ($record['buildings'] as $term) {
          if (isset($term['translated'])) {
            $term_name = $term['translated'];

            if ($source_name != $term_name) {
              $existing_term = \Drupal::entityTypeManager()
                ->getStorage('taxonomy_term')
                ->loadByProperties(['name' => $source_name, 'vid' => 'buildings']);
              $existing_term = reset($existing_term);

              if ($existing_term) {
                if ($existing_term->hasTranslation('sv')) {
                  $existing_term->removeTranslation('sv');
                }
                $existing_term->addTranslation('sv', ['name' => $term_name])->save();
              }
            }
          }
        }
      }

      // Translate EN language terms using FI as source.
      foreach ($json_en['records'] as $record) {
        foreach ($record['buildings'] as $term) {
          if (isset($term['translated'])) {
            $term_name = $term['translated'];

            if ($source_name != $term_name) {
              $existing_term = \Drupal::entityTypeManager()
                ->getStorage('taxonomy_term')
                ->loadByProperties(['name' => $source_name, 'vid' => 'buildings']);
              $existing_term = reset($existing_term);

              if ($existing_term) {
                if ($existing_term->hasTranslation('en')) {
                  $existing_term->removeTranslation('en');
                }
                $existing_term->addTranslation('en', ['name' => $term_name])->save();
              }
            }
          }
        }
      }
    }
  } else {
    echo 'https://historia.hel.fi/fi/media/' . $mid . '/edit' . PHP_EOL;
  }
}

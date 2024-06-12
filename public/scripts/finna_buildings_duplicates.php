<?php

use Drupal\taxonomy\Entity\Term;
use Drupal\term_merge\TermMerger;

$vid = 'buildings';
$terms = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadTree($vid);
foreach ($terms as $term) {
  $term_name = $term->name;

  $existing_terms = \Drupal::entityTypeManager()
  ->getStorage('taxonomy_term')
  ->loadByProperties(['name' => $term_name, 'vid' => 'buildings']);

  foreach ($existing_terms as $key => $value) {
    if ($value->hasTranslation('sv')) {
      unset($existing_terms[$key]);
    } else if ($value->hasTranslation('en')) {
      unset($existing_terms[$key]);
    }
  }

  if (count($existing_terms) > 1) {

    foreach ($existing_terms as $existing_term) {
      echo $existing_term->name->value . "\n";
    }

    $root = array_shift($existing_terms);

    \Drupal::service('term_merge.term_merger')->mergeIntoTerm($existing_terms, $root);
  }
}

<?php

namespace Drupal\mymodule;

use Drupal\Component\Utility\Html;
use Drupal\taxonomy\Entity\Term;

/**
 * Generate URL aliases for articles.
 */
class ArticlePathAlias {

  protected $terms = [
    'Term name 1' => 'custom/alias',
    'Term name 2' => 'custom2/alias',
    'Term name 3' => 'custom3/alias',
  ];
  protected $pattern = '/%term%/%year%/%monthnum%/%day%/%postname%';

  public function generate($context) {
    if ($context['bundle'] === 'article' && ($context['op'] == 'insert' || $context['op'] == 'update')) {
      return $this->assembleAlias($context['data']['node']);
    }
  }

  protected function assembleAlias($entity) {
    $date = new \DateTime(date('c', $entity->getCreatedTime()));
    $parameters = [
      '%year%'     => $date->format('Y'),
      '%monthnum%' => $date->format('m'),
      '%day%'      => $date->format('d'),
      '%postname%' => Html::cleanCssIdentifier($entity->getTitle()),
      '%term%'     => $this->findTermAlias($entity),
    ];
    if (!empty($parameters['%term%'])) {
      return str_replace(array_keys($parameters), array_values($parameters), $this->pattern);
    }
  }

  protected function findTermAlias($entity) {
    // Make sure to change `field_keywords` to the field you would like to check.
    if ($keywords = $entity->get('field_keywords')->getValue()) {
      foreach ($keywords as $data) {
        $term = Term::load($data['target_id']);
        $name = $term->getName();
        if (in_array($name, array_keys($this->terms))) {
          return $this->terms[$name];
        }
      }
    }
  }
}

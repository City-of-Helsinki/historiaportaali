<?php

declare(strict_types=1);

namespace Drupal\mymodule;

use Drupal\Component\Utility\Html;
use Drupal\taxonomy\Entity\Term;

/**
 * Generate URL aliases for articles.
 */
class ArticlePathAlias {

  /**
   * Map of term names to custom aliases.
   *
   * @var array
   */
  protected $terms = [
    'Term name 1' => 'custom/alias',
    'Term name 2' => 'custom2/alias',
    'Term name 3' => 'custom3/alias',
  ];

  /**
   * URL pattern template for article aliases.
   *
   * @var string
   */
  protected $pattern = '/%term%/%year%/%monthnum%/%day%/%postname%';

  /**
   * Generate a URL alias for an article.
   *
   * @param array $context
   *   The context containing bundle, operation, and node data.
   *
   * @return string|null
   *   The generated alias or NULL if not applicable.
   */
  public function generate($context) {
    if ($context['bundle'] === 'article' && ($context['op'] == 'insert' || $context['op'] == 'update')) {
      return $this->assembleAlias($context['data']['node']);
    }
    return null;
  }

  /**
   * Assemble the URL alias using the pattern and entity data.
   *
   * @param \Drupal\node\NodeInterface $entity
   *   The article node entity.
   *
   * @return string|null
   *   The assembled alias or NULL if no term alias found.
   */
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
    return null;
  }

  /**
   * Find the term alias for the given entity.
   *
   * @param \Drupal\node\NodeInterface $entity
   *   The article node entity.
   *
   * @return string|null
   *   The term alias or NULL if not found.
   */
  protected function findTermAlias($entity) {
    // Make sure to change `field_keywords` to the field you would
    // like to check.
    if ($keywords = $entity->get('field_keywords')->getValue()) {
      foreach ($keywords as $data) {
        $term = Term::load($data['target_id']);
        $name = $term->getName();
        if (in_array($name, array_keys($this->terms))) {
          return $this->terms[$name];
        }
      }
    }
    return null;
  }

}

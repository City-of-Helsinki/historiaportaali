<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Form;

use Drupal\Core\DependencyInjection\AutowireTrait;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\helhist_search\SearchPathResolver;

/**
 * Base class for search forms.
 */
abstract class SearchFormBase extends FormBase {

  use AutowireTrait;

  public function __construct(
    protected SearchPathResolver $searchPathResolver,
  ) {}

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['#method'] = 'get';
    $form['#action'] = $this->searchPathResolver->getSearchPagePath();
    $form['#attributes'] = [
      'role' => 'search',
    ];

    $form['search_wrapper'] = [
      '#type' => 'container',
      '#attributes' => [
        'class' => ['hds-text-input', 'hds-text-input--search'],
      ],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Form submits via GET to the search page, no custom handling needed.
  }

}

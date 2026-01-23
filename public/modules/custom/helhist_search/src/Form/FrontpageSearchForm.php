<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\helhist_search\SearchPathResolver;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a frontpage search form.
 */
class FrontpageSearchForm extends FormBase {

  /**
   * The search path resolver service.
   *
   * @var \Drupal\helhist_search\SearchPathResolver
   */
  protected $searchPathResolver;

  /**
   * Constructs a new FrontpageSearchForm object.
   *
   * @param \Drupal\helhist_search\SearchPathResolver $search_path_resolver
   *   The search path resolver service.
   */
  public function __construct(SearchPathResolver $search_path_resolver) {
    $this->searchPathResolver = $search_path_resolver;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new self(
      $container->get('helhist_search.search_path_resolver')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'helhist_search_frontpage_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
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

    $form['search_wrapper']['label'] = [
      '#type' => 'html_tag',
      '#tag' => 'label',
      '#value' => $this->t('Search from content', [], ['context' => 'Search']),
      '#attributes' => [
        'for' => 'edit-q-frontpage',
        'class' => ['hds-text-input__label'],
      ],
    ];

    $form['search_wrapper']['q'] = [
      '#type' => 'textfield',
      '#placeholder' => $this->t('Location, person, topic, event...', [], ['context' => 'Search']),
      '#attributes' => [
        'autocomplete' => 'off',
        'id' => 'edit-q-frontpage',
      ],
      '#theme_wrappers' => [],
    ];

    $form['search_wrapper']['submit'] = [
      '#type' => 'html_tag',
      '#tag' => 'button',
      '#value' => '<span class="hds-button__label">' . $this->t('Search') . '</span>',
      '#attributes' => [
        'type' => 'submit',
        'class' => ['hds-button', 'hds-button--primary'],
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

<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\helhist_search\SearchPathResolver;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a header search form.
 */
class HeaderSearchForm extends FormBase {

  /**
   * The search path resolver service.
   *
   * @var \Drupal\helhist_search\SearchPathResolver
   */
  protected $searchPathResolver;

  /**
   * Constructs a new HeaderSearchForm object.
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
    return 'helhist_search_header_form';
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
      '#value' => $this->t('Search from site', [], ['context' => 'Search']),
      '#attributes' => [
        'for' => 'edit-q-header',
        'class' => ['hds-text-input__label', 'hiddenFromScreen'],
      ],
    ];

    $form['search_wrapper']['input_wrapper'] = [
      '#type' => 'container',
      '#attributes' => [
        'class' => ['hds-text-input__input-wrapper'],
      ],
    ];

    $form['search_wrapper']['input_wrapper']['q'] = [
      '#type' => 'textfield',
      '#placeholder' => $this->t('Location, person, topic, event...', [], ['context' => 'Search']),
      '#size' => '80',
      '#attributes' => [
        'autocomplete' => 'off',
        'id' => 'edit-q-header',
      ],
      '#theme_wrappers' => [],
    ];

    $form['search_wrapper']['input_wrapper']['submit'] = [
      '#type' => 'html_tag',
      '#tag' => 'button',
      '#value' => '<span aria-hidden="true" class="hel-icon hel-icon--search hds-icon--size-m"></span>',
      '#attributes' => [
        'type' => 'submit',
        'class' => ['hds-button', 'hds-button--theme-black'],
        'aria-label' => $this->t('Search', [], ['context' => 'Header search']),
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

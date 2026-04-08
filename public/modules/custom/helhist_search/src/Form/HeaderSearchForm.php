<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Form;

use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a header search form.
 */
class HeaderSearchForm extends SearchFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'helhist_search_header_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form = parent::buildForm($form, $form_state);

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

}

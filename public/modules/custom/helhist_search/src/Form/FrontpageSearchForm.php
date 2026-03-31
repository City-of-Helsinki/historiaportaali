<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Form;

use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a frontpage search form.
 */
class FrontpageSearchForm extends SearchFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'helhist_search_frontpage_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form = parent::buildForm($form, $form_state);

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

}

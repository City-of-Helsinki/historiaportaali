<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\TypedConfigManagerInterface;
use Drupal\Core\DependencyInjection\AutowireTrait;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure search page settings.
 */
class SearchConfigForm extends ConfigFormBase {

  use AutowireTrait;

  /**
   * Constructs a SearchConfigForm object.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    TypedConfigManagerInterface $typedConfigManager,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected ModuleHandlerInterface $moduleHandler,
  ) {
    parent::__construct($config_factory, $typedConfigManager);
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['helhist_search.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'helhist_search_settings';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('helhist_search.settings');

    if ($this->moduleHandler->moduleExists('helhist_kore_search')) {
      $form['kore_search_page_node'] = [
        '#type' => 'entity_autocomplete',
        '#target_type' => 'node',
        '#title' => $this->t('School register search page'),
        '#description' => $this->t('The node that host the koulurekisteri search.'),
        '#default_value' => $config->get('kore_search_page_node') ? $this->entityTypeManager->getStorage('node')->load($config->get('kore_search_page_node')) : NULL,
        '#required' => FALSE,
      ];
    }

    $form['search_page_node'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#title' => $this->t('Main search page'),
      '#description' => $this->t('The node that host site main search.'),
      '#default_value' => $config->get('search_page_node') ? $this->entityTypeManager->getStorage('node')->load($config->get('search_page_node')) : NULL,
      '#required' => TRUE,
    ];
    $form['mapping_mode'] = [
      '#type' => 'select',
      '#title' => $this->t('Search mapping mode'),
      '#description' => $this->t('Match your Elasticsearch index: Text mapping for keyword-type fields, Keyword mapping for text-type fields with .keyword subfields. Wrong mode causes "Fielddata is disabled" or empty facets.'),
      '#options' => [
        'text' => $this->t('Text mapping'),
        'keyword' => $this->t('Keyword mapping'),
      ],
      '#default_value' => $config->get('mapping_mode') ?: 'text',
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $config = $this->config('helhist_search.settings')
      ->set('search_page_node', $form_state->getValue('search_page_node'))
      ->set('mapping_mode', $form_state->getValue('mapping_mode'));

    if ($this->moduleHandler->moduleExists('helhist_kore_search')) {
      $config->set('kore_search_page_node', $form_state->getValue('kore_search_page_node'));
    }

    $config->save();
    parent::submitForm($form, $form_state);
  }

}
